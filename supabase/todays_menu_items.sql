-- Table to track which menu items are available on which day
CREATE TABLE todays_menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by date
CREATE INDEX idx_todays_menu_items_date ON todays_menu_items(date);
-- Index for fast lookup by menu_item_id
CREATE INDEX idx_todays_menu_items_menu_item_id ON todays_menu_items(menu_item_id); 