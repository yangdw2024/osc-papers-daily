-- Supabase 数据库初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行以下 SQL

-- 1. 创建论文表
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  abstract TEXT DEFAULT '',
  published_date TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  doi TEXT,
  arxiv_id TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  name TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- 3. 创建元数据表（存储系统状态）
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- 4. 创建索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_papers_published_date ON papers (published_date DESC);
CREATE INDEX IF NOT EXISTS idx_papers_tags ON papers USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_papers_fetched_at ON papers (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_title_search ON papers USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_papers_abstract_search ON papers USING GIN (to_tsvector('english', abstract));

-- 5. 设置 RLS (Row Level Security) 策略
-- 允许匿名用户读取论文
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Papers are publicly readable" ON papers
  FOR SELECT USING (true);

CREATE POLICY "Tags are publicly readable" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Meta is publicly readable" ON meta
  FOR SELECT USING (true);

-- 允许 service role 完全操作
CREATE POLICY "Service role can manage papers" ON papers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage tags" ON tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage meta" ON meta
  FOR ALL USING (auth.role() = 'service_role');
