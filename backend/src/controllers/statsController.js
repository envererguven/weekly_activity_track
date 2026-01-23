const db = require('../db');
const axios = require('axios');

exports.getStats = async (req, res) => {
    try {
        const teamSize = await db.query('SELECT COUNT(*) FROM users WHERE is_active = true');
        const totalActivities = await db.query('SELECT COUNT(*) FROM activities');

        res.json({
            team_size: parseInt(teamSize.rows[0].count),
            total_activities: parseInt(totalActivities.rows[0].count),
            system_metrics: "All systems operational"
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { scope, userId } = req.query; // scope='personal' or 'global', userId needed for personal

        const isPersonal = scope === 'personal';
        const userFilter = isPersonal && userId ? `AND a.user_id = ${userId}` : '';
        const userFilterU = isPersonal && userId ? `AND u.id = ${userId}` : '';

        // 1. Total Effort
        const effortQuery = `
            SELECT sum((value->>'effort')::numeric) as total_effort 
            FROM activities a, jsonb_each(weekly_data)
            WHERE 1=1 ${userFilter}
        `;
        const totalEffortResult = await db.query(effortQuery);
        const totalEffort = totalEffortResult.rows[0].total_effort || 0;

        // 2. Effort by Person (Only relevant for Global, or just single user for Personal)
        const effortByPersonQuery = `
            SELECT u.full_name, COALESCE(sum((value->>'effort')::numeric), 0) as effort
            FROM users u
            LEFT JOIN activities a ON u.id = a.user_id
            LEFT JOIN jsonb_each(a.weekly_data) ON true
            WHERE u.is_active = true ${userFilterU}
            GROUP BY u.full_name
            ORDER BY effort DESC
            LIMIT 10
        `;
        const effortByPerson = await db.query(effortByPersonQuery);

        // 3. Status Distribution
        const statusDistQuery = `
            SELECT status, COUNT(*) as count 
            FROM activities a
            WHERE 1=1 ${userFilter}
            GROUP BY status
        `;
        const statusDist = await db.query(statusDistQuery);

        // 4. Activity Distribution (Category) - NEW
        const categoryDistQuery = `
            SELECT category, COUNT(*) as count 
            FROM activities a
            WHERE 1=1 ${userFilter}
            GROUP BY category
        `;
        const categoryDist = await db.query(categoryDistQuery);

        // 5. Effort by Product (Top 5) - NEW
        const effortByProductQuery = `
            SELECT p.name, COALESCE(sum((value->>'effort')::numeric), 0) as effort
            FROM products p
            LEFT JOIN activities a ON p.id = a.product_id
            LEFT JOIN jsonb_each(a.weekly_data) ON true
            WHERE 1=1 ${userFilter}
            GROUP BY p.name
            ORDER BY effort DESC
            LIMIT 5
        `;
        const effortByProduct = await db.query(effortByProductQuery);

        // 6. Heatmap Data (Activity count by day) - NEW
        // Using updated_at::date as proxy for activity date
        const heatmapQuery = `
            SELECT to_char(updated_at, 'YYYY-MM-DD') as date, COUNT(*) as count
            FROM activities a
            WHERE 1=1 ${userFilter}
            GROUP BY date
            ORDER BY date DESC
            LIMIT 60
        `;
        const heatmapData = await db.query(heatmapQuery);

        // 7. Top Users (Global only mostly, but query logic holds)
        // Reusing effortByPerson results for Table

        res.json({
            total_effort: parseFloat(totalEffort),
            effort_by_person: effortByPerson.rows.map(r => ({ ...r, effort: parseFloat(r.effort) })),
            status_distribution: statusDist.rows.map(r => ({ ...r, count: parseInt(r.count) })),
            category_distribution: categoryDist.rows.map(r => ({ ...r, count: parseInt(r.count) })),
            top_products: effortByProduct.rows.map(r => ({ ...r, effort: parseFloat(r.effort) })),
            heatmap_data: heatmapData.rows.map(r => ({ ...r, count: parseInt(r.count) }))
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: 'Server error retrieving stats' });
    }
};

exports.generateExecutiveSummary = async (req, res) => {
    try {
        const { llmUrl, model } = req.body;
        const targetUrl = llmUrl || 'http://host.docker.internal:11434/api/generate';
        const targetModel = model || 'llama3';

        // Fetch recent activities to send as context
        const activities = await db.query('SELECT subject, status, description FROM activities ORDER BY updated_at DESC LIMIT 50');
        const contextData = activities.rows.map(a => `- [${a.status}] ${a.subject}: ${a.description || ''}`).join('\n');

        const prompt = `
        You are an executive assistant. Based on the following recent activity logs from the team, 
        please write a concise Executive Summary highlighting key progress, risks, and completed items.
        
        Activities:
        ${contextData}
        
        Summary:
        `;

        // Call LLM
        const response = await axios.post(targetUrl, {
            model: targetModel,
            prompt: prompt,
            stream: false
        });

        const summary = response.data.response || response.data.content || "No response content found.";

        res.json({ summary });

    } catch (error) {
        console.error("LLM Generation Error:", error.message);
        res.status(500).json({ error: 'Failed to generate summary. Ensure LLM service is reachable.', details: error.message });
    }
};
