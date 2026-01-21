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
        // 1. Total Effort
        // In a real app we'd need to parse weekly_data JSON to sum up efforts properly. 
        // For MVP, if we don't have normalized effort table, this is tricky.
        // Assuming 'activities' table might need better schema for pure SQL aggregation or we interpret JSON here.
        // BUT, requirements said "Harcanan Efor" is a field. If it's inside JSONB `weekly_data`, we can use jsonb queries.
        // Example weekly_data: { "2026-W01": { "progress": "...", "effort": 5 } }

        // Let's aggregate total effort across all records
        const effortQuery = `
            SELECT sum((value->>'effort')::numeric) as total_effort 
            FROM activities, jsonb_each(weekly_data)
        `;
        const totalEffortResult = await db.query(effortQuery);
        const totalEffort = totalEffortResult.rows[0].total_effort || 0;

        // 2. Effort by Person
        const effortByPersonQuery = `
            SELECT u.full_name, COALESCE(sum((value->>'effort')::numeric), 0) as effort
            FROM users u
            LEFT JOIN activities a ON u.id = a.user_id
            LEFT JOIN jsonb_each(a.weekly_data) ON true
            WHERE u.is_active = true
            GROUP BY u.full_name
        `;
        const effortByPerson = await db.query(effortByPersonQuery);

        // 3. Status Distribution
        const statusDistQuery = `
            SELECT status, COUNT(*) as count 
            FROM activities 
            GROUP BY status
        `;
        const statusDist = await db.query(statusDistQuery);

        // 4. Activity Count by User
        const activityCountQuery = `
            SELECT u.full_name, COUNT(a.id) as task_count
            FROM users u
            LEFT JOIN activities a ON u.id = a.user_id
            WHERE u.is_active = true
            GROUP BY u.full_name
         `;
        const activityCount = await db.query(activityCountQuery);

        res.json({
            total_effort: totalEffort,
            effort_by_person: effortByPerson.rows,
            status_distribution: statusDist.rows,
            activity_count_by_person: activityCount.rows
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
        // Note: Ollama API format usually expects { model: "name", prompt: "..." } and returns stream unless "stream": false
        const response = await axios.post(targetUrl, {
            model: targetModel,
            prompt: prompt,
            stream: false
        });

        // Ollama returns { response: "..." }
        // Other APIs might differ, but we'll target standard Ollama for now as requested.
        const summary = response.data.response || response.data.content || "No response content found.";

        res.json({ summary });

    } catch (error) {
        console.error("LLM Generation Error:", error.message);
        res.status(500).json({ error: 'Failed to generate summary. Ensure LLM service is reachable.', details: error.message });
    }
};
