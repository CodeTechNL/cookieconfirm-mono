## Migration plan

### Setting up the servers

The first step is to run CDK deploy to set up the servers. The following steps need to be taken:

- Create Cookie Scanner
- Create Meilisearch
- Create Consent Banner
- Create Platform

While creating the stacks, variables will be set which are required by the platform. Think about the cookie scanner SQS
queue URL, the banner storage URL and many more. Once all of those are set up, the platform will create a new fresh
database which is connected to the platform. The current database, which is a custom instance (which is manually
created) needs to be exported and imported in to the new database. The consent log table is pretty big and takes a lot
of time to export. For that case, we can skip this table and export everything except that table. The new consent logs
will run through AWS Athena. A plan how to get the existing consent logs in to the new database will be lower in this
plan.  