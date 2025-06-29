export interface GridColumn {
  column_key: string;
  column_name: string;
  type: string;
  align?: string;
}

export interface GridRow {
  [key: string]: any;
}
