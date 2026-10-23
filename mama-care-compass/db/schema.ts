import {sqliteTable,text,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const careRecords=sqliteTable('care_records',{
 owner:text('owner').notNull(),id:text('id').notNull(),kind:text('kind').notNull(),occurredAt:text('occurred_at').notNull(),payload:text('payload').notNull(),updatedAt:text('updated_at').notNull()
},t=>[primaryKey({columns:[t.owner,t.id]}),index('idx_care_owner_kind_date').on(t.owner,t.kind,t.occurredAt)]);
