## scdp table descriptions 
 
Table:	Responsibility
roles:	Stores application roles such as ADMIN and MARKETER.
users:	Stores user accounts, login emails, password hashes, roles, and activation status.
products:	Stores synchronized product information from the SCDP source.
depots:	Stores synchronized depot or warehouse information.
stock:	Stores synchronized stock quantities and product/depot details.
stock_movements:	Stores stock transfers, removals, deposits, and movement history.
synchronization_runs:	Records each synchronization execution, its status, timing, and record counts.
synchronization_tables:	Stores per-table synchronization results and errors.
audit_logs:	Records user actions for security and traceability.
marketer_applications:	Stores marketer registration applications and approval status.
otps:	Stores one-time passwords for verification and password reset.
notifications:	Stores notifications sent to users or specific roles.
_prisma_migrations	Internal Prisma table that tracks applied database changes.