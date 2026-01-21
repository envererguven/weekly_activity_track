-- Create Tables

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Member',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    ref_id VARCHAR(100),
    criticality VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    weekly_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data

INSERT INTO users (full_name) VALUES 
('Enver Ergüven'), ('Ayşe Kaya'), ('Ali Bulut'), ('Mehmet Yılmaz'), ('Fatma Demir'),
('Hasan Öztürk'), ('Elif Şahin'), ('Burak Karahan'), ('Selin Aksoy'), ('Okan Güler'),
('Deniz Arslan'), ('Ceren Yıldız'), ('Emre Korkmaz'), ('Gizem Tekin'), ('Tolga Aydın')
ON CONFLICT DO NOTHING;

INSERT INTO products (name) VALUES 
('PIMS'), ('DDP'), ('CRM'), ('Billing'), ('Mediation')
ON CONFLICT DO NOTHING;
