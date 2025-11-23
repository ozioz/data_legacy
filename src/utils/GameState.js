// Game Constants & Data Definitions

export const HEROES = {
    ENGINEER: {
        id: 'ENGINEER',
        name: 'Data Engineer',
        desc: 'The Builder. Architect of pipelines and infrastructure.',
        img: '/assets/dataengineer_1.png'
    },
    SCIENTIST: {
        id: 'SCIENTIST',
        name: 'Data Scientist',
        desc: 'The Optimizer. Master of algorithms and models.',
        img: '/assets/data_scientist_1.png'
    },
    ANALYST: {
        id: 'ANALYST',
        name: 'BI Analyst',
        desc: 'The Visionary. Translator of data into insights.',
        img: '/assets/data_analyst_1.png'
    }
};

export const MASCOTS = {
    pipeline: '/assets/pipeline.png',
    defense: '/assets/firewall.png',
    farm: '/assets/farmer.png',
    runner: '/assets/runner.png',
    query: '/assets/wizard.png'
};

export const GAME_TYPES = {
    PIPELINE: 'PIPELINE', // Classic Logic
    RUNNER: 'RUNNER',     // Null Runner (Action)
    QUERY: 'QUERY',       // Query Master (Word Puzzle)
    FARM: 'FARM',         // Data Farm (Idle)
    TOWER: 'TOWER',       // Server Guardian (Tower Defense)
    BEHAVIORAL: 'BEHAVIORAL' // RPG Scenario Decisions
};

export const CAREER_PATHS = {
    TECHNICAL: 'TECHNICAL',
    BEHAVIORAL: 'BEHAVIORAL'
};

// Educational Story Content for Pre-Game Briefing and Post-Game Impact
export const GAME_STORIES = {
    [GAME_TYPES.PIPELINE]: {
        topic: 'ETL Pipelines & Data Lineage',
        briefing: 'The CEO needs the Sales Dashboard updated immediately. The data is messy. You must build a robust pipeline to extract, transform, and load the data correctly.',
        impact: 'Success! By building this pipeline, you automated a task that took 4 hours manually. The Data Warehouse is now synced in real-time.'
    },
    [GAME_TYPES.TOWER]: {
        topic: 'System Reliability & Security (SRE)',
        briefing: 'It\'s Black Friday! Traffic is spiking, and malicious bots are attacking our Production Database. Deploy defenses to keep the system uptime at 99.9%.',
        impact: 'Crisis Averted! Your firewall rules and load balancers prevented a system crash. The company saved thousands of dollars in potential lost revenue.'
    },
    [GAME_TYPES.FARM]: {
        topic: 'Data Quality & Maturity Models',
        briefing: 'We have raw data seeds, but they are useless without care. Cultivate the data through the \'Bronze\', \'Silver\', and \'Gold\' layers to make it consumable for analytics.',
        impact: 'Harvest Complete! You turned raw, unstructured logs into high-quality \'Gold Layer\' tables. The Analytics team can now trust the data 100%.'
    },
    [GAME_TYPES.RUNNER]: {
        topic: 'Machine Learning: Overfitting vs. Generalization',
        briefing: 'You are training a new AI model. You must collect valid \'Signals\' (Green) while ignoring the \'Noise\' (Red). Be careful not to Overfit!',
        impact: 'Model Trained! Because you filtered out the noise, your model generalizes well on new data. The Prediction Accuracy increased by 15%.'
    },
    [GAME_TYPES.QUERY]: {
        topic: 'SQL Optimization & Syntax',
        briefing: 'The Marketing Director is asking a complex question about user churn. You need to write the correct SQL query syntax to retrieve the answer quickly.',
        impact: 'Query Executed! You extracted the exact insight needed without timing out the database. The marketing team is using your report for the new campaign.'
    }
};

export const ITEMS = {
    // Common / Basic
    RAW_LOGS: { id: 'RAW_LOGS', name: 'Raw Logs', type: 'DATA' },
    CSV: { id: 'CSV', name: 'CSV File', type: 'DATA' },
    JSON: { id: 'JSON', name: 'JSON Data', type: 'DATA' },
    DATABASE: { id: 'DATABASE', name: 'SQL Database', type: 'STORAGE' },
    EXCEL: { id: 'EXCEL', name: 'Excel Sheet', type: 'DATA' },

    // Processing
    PYTHON_CLEAN: { id: 'PYTHON_CLEAN', name: 'Python Script', type: 'PROCESS' },
    SQL_QUERY: { id: 'SQL_QUERY', name: 'SQL Query', type: 'QUERY' },
    PANDAS: { id: 'PANDAS', name: 'Pandas Transform', type: 'PROCESS' },
    SPARK: { id: 'SPARK', name: 'Spark Job', type: 'PROCESS' },

    // Infrastructure
    API: { id: 'API', name: 'REST API', type: 'SOURCE' },
    KAFKA: { id: 'KAFKA', name: 'Kafka Stream', type: 'TRANSPORT' },
    WAREHOUSE: { id: 'WAREHOUSE', name: 'Snowflake DW', type: 'STORAGE' },
    DATALAKE: { id: 'DATALAKE', name: 'S3 Data Lake', type: 'STORAGE' },
    AIRFLOW: { id: 'AIRFLOW', name: 'Airflow DAG', type: 'ORCHESTRATION' },
    K8S: { id: 'K8S', name: 'Kubernetes', type: 'INFRA' },
    DOCKER: { id: 'DOCKER', name: 'Docker Container', type: 'INFRA' },
    IOT_SENSOR: { id: 'IOT_SENSOR', name: 'IoT Sensor', type: 'SOURCE' },
    BIGQUERY: { id: 'BIGQUERY', name: 'BigQuery', type: 'STORAGE' },
    REDIS: { id: 'REDIS', name: 'Redis Cache', type: 'STORAGE' },

    // Data Science
    DATASET: { id: 'DATASET', name: 'Training Set', type: 'DATA' },
    SPLIT: { id: 'SPLIT', name: 'Train/Test Split', type: 'PROCESS' },
    NORMALIZE: { id: 'NORMALIZE', name: 'Normalization', type: 'PROCESS' },
    LINEAR_REG: { id: 'LINEAR_REG', name: 'Linear Regression', type: 'MODEL' },
    RANDOM_FOREST: { id: 'RANDOM_FOREST', name: 'Random Forest', type: 'MODEL' },
    XGBOOST: { id: 'XGBOOST', name: 'XGBoost', type: 'MODEL' },
    NEURAL_NET: { id: 'NEURAL_NET', name: 'Neural Network', type: 'MODEL' },
    TENSORFLOW: { id: 'TENSORFLOW', name: 'TensorFlow', type: 'FRAMEWORK' },
    IMG_PROCESS: { id: 'IMG_PROCESS', name: 'Image Augmentation', type: 'PROCESS' },
    VALIDATION: { id: 'VALIDATION', name: 'Cross-Validation', type: 'PROCESS' },
    DEPLOY_MODEL: { id: 'DEPLOY_MODEL', name: 'Model API', type: 'OUTPUT' },

    // Analytics
    PIVOT: { id: 'PIVOT', name: 'Pivot Table', type: 'ANALYSIS' },
    VLOOKUP: { id: 'VLOOKUP', name: 'VLOOKUP', type: 'ANALYSIS' },
    CHART_BAR: { id: 'CHART_BAR', name: 'Bar Chart', type: 'VISUAL' },
    CHART_LINE: { id: 'CHART_LINE', name: 'Line Graph', type: 'VISUAL' },
    POWER_BI: { id: 'POWER_BI', name: 'Power BI', type: 'TOOL' },
    TABLEAU: { id: 'TABLEAU', name: 'Tableau', type: 'TOOL' },
    STORY: { id: 'STORY', name: 'Data Story', type: 'OUTPUT' },
    DASHBOARD: { id: 'DASHBOARD', name: 'Exec Dashboard', type: 'OUTPUT' },
    REPORT: { id: 'REPORT', name: 'PDF Report', type: 'OUTPUT' },
    KPI: { id: 'KPI', name: 'KPI Metrics', type: 'ANALYSIS' }
};

// Helper to generate levels
const createLevel = (id, name, desc, scenario, gameType, config, xp = 100) => {
    // Config depends on gameType
    // PIPELINE: { sequence: [], extra: [] }
    // RUNNER: { target: 20, speed: 10 }
    // QUERY: { target: "SELECT * FROM Users", blocks: [] }
    // FARM: { target: 10 }
    // TOWER: { duration: 30 }

    return {
        id,
        name,
        desc,
        scenario,
        gameType,
        config,
        xpReward: xp
    };
};

export const LEVELS = {
    // ================= DATA ENGINEER PATH =================
    ENGINEER_1: createLevel('ENGINEER_1', 'ETL Basics', 'Data Pipeline',
        'Connect the source to the destination.',
        GAME_TYPES.PIPELINE,
        { sequence: [ITEMS.CSV.id, ITEMS.PYTHON_CLEAN.id, ITEMS.DATABASE.id], extra: [ITEMS.JSON.id, ITEMS.SQL_QUERY.id] }, 100),

    ENGINEER_2: createLevel('ENGINEER_2', 'Signal vs. Noise', 'Clean the Stream',
        'Collect the Signal (Green), Avoid the Noise (Red)!',
        GAME_TYPES.RUNNER,
        { target: 20, speed: 10 }, 150),

    ENGINEER_3: createLevel('ENGINEER_3', 'SQL Basics', 'Simple Query',
        'Select all users from the database.',
        GAME_TYPES.QUERY,
        { target: 'SELECT * FROM USERS', blocks: ['SELECT', '*', 'FROM', 'USERS', 'WHERE', 'ID'] }, 150),

    ENGINEER_4: createLevel('ENGINEER_4', 'Data Farm', 'Harvesting Logs',
        'Collect the raw logs for processing.',
        GAME_TYPES.FARM,
        { target: 10 }, 200),

    ENGINEER_5: createLevel('ENGINEER_5', 'Server Guardian', 'Protect Prod',
        'Defend the production database from incoming bugs!',
        GAME_TYPES.TOWER,
        { duration: 30, spawnRate: 1000 }, 250),

    ENGINEER_6: createLevel('ENGINEER_6', 'Stream Processing', 'Kafka Pipeline',
        'Build a real-time data streaming pipeline.',
        GAME_TYPES.PIPELINE,
        { sequence: [ITEMS.IOT_SENSOR.id, ITEMS.KAFKA.id, ITEMS.SPARK.id, ITEMS.DATALAKE.id], extra: [ITEMS.API.id, ITEMS.REDIS.id] }, 300),

    ENGINEER_7: createLevel('ENGINEER_7', 'Data Quality', 'Clean the Stream',
        'Filter out bad data and keep only quality signals!',
        GAME_TYPES.RUNNER,
        { target: 25, speed: 12 }, 350),

    ENGINEER_8: createLevel('ENGINEER_8', 'Complex Queries', 'Advanced SQL',
        'Write complex queries to join and aggregate data.',
        GAME_TYPES.QUERY,
        { target: 'SELECT u.name, COUNT(o.id) FROM USERS u JOIN ORDERS o ON u.id = o.user_id GROUP BY u.name', blocks: ['SELECT', 'u.name,', 'COUNT(o.id)', 'FROM', 'USERS', 'u', 'JOIN', 'ORDERS', 'o', 'ON', 'u.id', '=', 'o.user_id', 'GROUP BY', 'u.name', 'WHERE', 'HAVING'] }, 400),

    ENGINEER_9: createLevel('ENGINEER_9', 'Scale Farm', 'Massive Harvest',
        'We need more data! Scale up the farm operations.',
        GAME_TYPES.FARM,
        { target: 20 }, 600),

    ENGINEER_10: createLevel('ENGINEER_10', 'The Architect', 'Final Defense',
        'The ultimate stress test. Defend the entire infrastructure!',
        GAME_TYPES.TOWER,
        { duration: 45, spawnRate: 800 }, 1000),

    // ================= DATA SCIENTIST PATH =================
    SCIENTIST_1: createLevel('SCIENTIST_1', 'Data Prep', 'Preprocessing',
        'Prepare the data for analysis.',
        GAME_TYPES.PIPELINE,
        { sequence: [ITEMS.RAW_LOGS.id, ITEMS.PANDAS.id, ITEMS.DATASET.id], extra: [ITEMS.API.id, ITEMS.EXCEL.id] }, 100),

    SCIENTIST_2: createLevel('SCIENTIST_2', 'Overfit Runner', 'Regularization',
        'Collect Signal, Avoid Noise/Overfitting!',
        GAME_TYPES.RUNNER,
        { target: 20, speed: 10 }, 150),

    SCIENTIST_3: createLevel('SCIENTIST_3', 'Feature Select', 'Select Features',
        'Select the best features for the model.',
        GAME_TYPES.QUERY,
        { target: 'SELECT FEATURES FROM DATASET', blocks: ['SELECT', 'FEATURES', 'FROM', 'DATASET', 'DROP', 'NULL'] }, 150),

    SCIENTIST_4: createLevel('SCIENTIST_4', 'Feature Farm', 'Feature Engineering',
        'Harvest features for the model.',
        GAME_TYPES.FARM,
        { target: 10 }, 200),

    SCIENTIST_5: createLevel('SCIENTIST_5', 'Model Guardian', 'Drift Defense',
        'Prevent data drift from corrupting the model!',
        GAME_TYPES.TOWER,
        { duration: 30, spawnRate: 1000 }, 250),

    SCIENTIST_6: createLevel('SCIENTIST_6', 'Model Training', 'Build Pipeline',
        'Create a complete ML training pipeline.',
        GAME_TYPES.PIPELINE,
        { sequence: [ITEMS.DATASET.id, ITEMS.SPLIT.id, ITEMS.NORMALIZE.id, ITEMS.RANDOM_FOREST.id, ITEMS.VALIDATION.id], extra: [ITEMS.LINEAR_REG.id, ITEMS.XGBOOST.id] }, 300),

    SCIENTIST_7: createLevel('SCIENTIST_7', 'Feature Selection', 'Find Signals',
        'Identify the most important features for your model!',
        GAME_TYPES.RUNNER,
        { target: 25, speed: 12 }, 350),

    SCIENTIST_8: createLevel('SCIENTIST_8', 'Model Query', 'Feature Engineering',
        'Select and transform features for optimal performance.',
        GAME_TYPES.QUERY,
        { target: 'SELECT FEATURES, TRANSFORM(SCALE) FROM DATASET WHERE IMPORTANCE > 0.5', blocks: ['SELECT', 'FEATURES,', 'TRANSFORM(SCALE)', 'FROM', 'DATASET', 'WHERE', 'IMPORTANCE', '>', '0.5', 'GROUP BY', 'DROP', 'NULL'] }, 400),

    SCIENTIST_9: createLevel('SCIENTIST_9', 'Training Farm', 'Epoch Harvest',
        'Train for more epochs! Harvest the results.',
        GAME_TYPES.FARM,
        { target: 20 }, 600),

    SCIENTIST_10: createLevel('SCIENTIST_10', 'AI Core', 'AGI Defense',
        'Protect the AGI core from adversarial attacks!',
        GAME_TYPES.TOWER,
        { duration: 45, spawnRate: 800 }, 1000),

    // ================= BI ANALYST PATH =================
    ANALYST_1: createLevel('ANALYST_1', 'Data Viz', 'Visualization',
        'Create a chart from the data.',
        GAME_TYPES.PIPELINE,
        { sequence: [ITEMS.EXCEL.id, ITEMS.PIVOT.id, ITEMS.CHART_BAR.id], extra: [ITEMS.CSV.id, ITEMS.SQL_QUERY.id] }, 100),

    ANALYST_2: createLevel('ANALYST_2', 'Trend Runner', 'Spot the Trend',
        'Follow the Signal, ignore the Noise!',
        GAME_TYPES.RUNNER,
        { target: 20, speed: 10 }, 150),

    ANALYST_3: createLevel('ANALYST_3', 'KPI Query', 'Calculate KPI',
        'Calculate the total revenue.',
        GAME_TYPES.QUERY,
        { target: 'SELECT SUM(REVENUE) FROM SALES', blocks: ['SELECT', 'SUM(REVENUE)', 'FROM', 'SALES', 'COUNT', 'DISTINCT'] }, 150),

    ANALYST_4: createLevel('ANALYST_4', 'Insight Farm', 'Gathering Facts',
        'Harvest insights from the raw reports.',
        GAME_TYPES.FARM,
        { target: 10 }, 200),

    ANALYST_5: createLevel('ANALYST_5', 'Dashboard Guardian', 'Uptime Defense',
        'Keep the dashboard up while users spam refresh!',
        GAME_TYPES.TOWER,
        { duration: 30, spawnRate: 1000 }, 250),

    ANALYST_6: createLevel('ANALYST_6', 'Report Pipeline', 'Data to Insights',
        'Build a pipeline from raw data to executive reports.',
        GAME_TYPES.PIPELINE,
        { sequence: [ITEMS.CSV.id, ITEMS.PIVOT.id, ITEMS.CHART_LINE.id, ITEMS.DASHBOARD.id], extra: [ITEMS.EXCEL.id, ITEMS.KPI.id] }, 300),

    ANALYST_7: createLevel('ANALYST_7', 'Trend Analysis', 'Follow the Data',
        'Track trends and patterns in the data stream!',
        GAME_TYPES.RUNNER,
        { target: 25, speed: 12 }, 350),

    ANALYST_8: createLevel('ANALYST_8', 'Query Master', 'Complex Aggregation',
        'Filter and aggregate the sales data.',
        GAME_TYPES.QUERY,
        { target: 'SELECT REGION, SUM(SALES) FROM ORDERS GROUP BY REGION HAVING SUM(SALES) > 1000', blocks: ['SELECT', 'REGION,', 'SUM(SALES)', 'FROM', 'ORDERS', 'GROUP BY', 'REGION', 'HAVING', 'SUM(SALES)', '>', '1000'] }, 450),

    ANALYST_9: createLevel('ANALYST_9', 'Report Farm', 'Monthly Close',
        'Harvest all the monthly reports on time.',
        GAME_TYPES.FARM,
        { target: 20 }, 600),

    ANALYST_10: createLevel('ANALYST_10', 'C-Suite Strategy', 'Boardroom Defense',
        'Defend your numbers against the board\'s questions!',
        GAME_TYPES.TOWER,
        { duration: 45, spawnRate: 800 }, 1000),

    // ================= BEHAVIORAL PATH LEVELS =================
    // Data Engineer Behavioral Path
    ENGINEER_BEHAVIORAL_1: createLevel('ENGINEER_BEHAVIORAL_1', 'Prioritization', 'Real-time vs Batch',
        'Marketing wants a real-time pipeline for a monthly report.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'Marketing wants a real-time pipeline for a monthly report. They say it\'s "urgent" but the report only runs once per month.',
            choices: [
                { text: 'Build it immediately. They said it\'s urgent.', score: 0, feedback: 'You wasted resources on unnecessary real-time infrastructure. The monthly batch job would have sufficed.' },
                { text: 'Refuse. Tell them they don\'t need it.', score: 0, feedback: 'Too aggressive. You damaged the relationship without explaining the reasoning.' },
                { text: 'Explain cost/benefit and suggest batch processing.', score: 100, feedback: 'Perfect! You demonstrated technical leadership by explaining the trade-offs. Marketing agreed to batch processing, saving the company infrastructure costs.' }
            ],
            correctChoice: 2
        }, 150),

    ENGINEER_BEHAVIORAL_2: createLevel('ENGINEER_BEHAVIORAL_2', 'Incident Management', 'Production Crisis',
        'Production DB is down. CEO is screaming.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'Production database crashed during peak hours. The CEO is in your Slack channel demanding answers. The team is panicking.',
            choices: [
                { text: 'Respond to CEO immediately with explanations.', score: 0, feedback: 'You wasted time on communication while the system was still down. Fix first, explain later.' },
                { text: 'Ignore the CEO and focus on fixing.', score: 50, feedback: 'Good focus, but poor communication. You should acknowledge the issue briefly.' },
                { text: 'Focus on fixing first, communicate ETA, debrief later.', score: 100, feedback: 'Excellent crisis management! You prioritized the fix, gave stakeholders visibility, and saved the post-mortem for after resolution.' }
            ],
            correctChoice: 2
        }, 200),

    ENGINEER_BEHAVIORAL_3: createLevel('ENGINEER_BEHAVIORAL_3', 'Saying No', 'Code Quality Gate',
        'Dev team wants to push bad code to prod to hit deadline.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'The dev team wants to push code with known data quality issues to production to meet a deadline. They\'re pressuring you to approve the deployment.',
            choices: [
                { text: 'Approve it. Deadlines are important.', score: 0, feedback: 'Bad code reached production. Data integrity was compromised, causing downstream issues. You failed as a gatekeeper.' },
                { text: 'Yell at them and refuse angrily.', score: 0, feedback: 'Too aggressive. You created team conflict without offering solutions.' },
                { text: 'Block the deployment, cite data integrity risks, suggest alternatives.', score: 100, feedback: 'Perfect! You protected data integrity while offering solutions. The team found a workaround that didn\'t compromise quality.' }
            ],
            correctChoice: 2
        }, 250),

    // Data Scientist Behavioral Path
    SCIENTIST_BEHAVIORAL_1: createLevel('SCIENTIST_BEHAVIORAL_1', 'Expectation Management', '100% Accuracy Myth',
        'Client expects 100% accuracy from your ML model.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'A client is demanding 100% accuracy from your machine learning model. They say "if humans can do it, why can\'t the AI?"',
            choices: [
                { text: 'Promise 100% accuracy and try to optimize.', score: 0, feedback: 'You set unrealistic expectations. When the model fails, the client lost trust in your team.' },
                { text: 'Tell them ML is impossible and refuse.', score: 0, feedback: 'Too negative. You didn\'t explain the value ML can provide.' },
                { text: 'Explain that ML is probabilistic, promise optimization not perfection.', score: 100, feedback: 'Excellent! You educated the client on ML fundamentals. They understood the value and set realistic expectations.' }
            ],
            correctChoice: 2
        }, 150),

    SCIENTIST_BEHAVIORAL_2: createLevel('SCIENTIST_BEHAVIORAL_2', 'Ethics & Bias', 'Model Bias Detection',
        'Model shows bias against a minority group but has high accuracy.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'Your model has 95% accuracy but shows significant bias against a protected demographic group. The product manager wants to deploy it anyway.',
            choices: [
                { text: 'Deploy it. High accuracy is what matters.', score: 0, feedback: 'You deployed a biased model. It caused harm to users and legal issues for the company.' },
                { text: 'Refuse to deploy but don\'t explain why.', score: 50, feedback: 'Good instinct, but poor communication. The team doesn\'t understand the ethical implications.' },
                { text: 'Flag it as a blocker, refuse to deploy until fixed, explain the ethical risks.', score: 100, feedback: 'Perfect! You demonstrated ethical leadership. The team fixed the bias, and the model was deployed safely.' }
            ],
            correctChoice: 2
        }, 200),

    // BI Analyst Behavioral Path
    ANALYST_BEHAVIORAL_1: createLevel('ANALYST_BEHAVIORAL_1', 'Requirement Gathering', 'Vague Dashboard Request',
        'Manager says "I want a dashboard" without specifics.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'Your manager says "I want a dashboard" but provides no details about what metrics, timeframe, or business questions it should answer.',
            choices: [
                { text: 'Build a generic dashboard with common metrics.', score: 0, feedback: 'You built something useless. The manager rejected it because it didn\'t answer their actual questions.' },
                { text: 'Tell them you can\'t build it without more info.', score: 50, feedback: 'Good instinct, but too passive. You should ask the right questions.' },
                { text: 'Ask "What business question are we trying to solve?" before building.', score: 100, feedback: 'Perfect! You uncovered the real need. The dashboard you built actually solved their problem and saved time.' }
            ],
            correctChoice: 2
        }, 150),

    ANALYST_BEHAVIORAL_2: createLevel('ANALYST_BEHAVIORAL_2', 'Data Integrity', 'Misleading Visualization',
        'VP wants to truncate the Y-axis to make growth look huge.',
        GAME_TYPES.BEHAVIORAL,
        {
            scenario: 'A VP asks you to truncate the Y-axis on a chart to make a 2% growth look like 50% growth for a board presentation.',
            choices: [
                { text: 'Do it. They\'re the VP.', score: 0, feedback: 'You created a misleading visualization. When the board discovered the truth, you lost credibility.' },
                { text: 'Refuse angrily and call them unethical.', score: 0, feedback: 'Too aggressive. You damaged the relationship without offering alternatives.' },
                { text: 'Refuse politely, explain it creates a misleading narrative, suggest honest alternatives.', score: 100, feedback: 'Perfect! You maintained integrity while being diplomatic. The VP appreciated your honesty and used your alternative visualization.' }
            ],
            correctChoice: 2
        }, 200),
};
