import {Construct} from "constructs";
import {CfnDatabase} from "aws-cdk-lib/aws-glue";

type AthenaDatabaseProps = {
    account: string
    databaseName: string,
}

export class CfnDatabaseResource extends Construct {
    private readonly resource: CfnDatabase;

    constructor(scope: Construct, id: string, props: AthenaDatabaseProps) {
        super(scope, id);

        const {account, databaseName} = props;

        this.resource = new CfnDatabase(this, 'ConsentRequestsDatabase', {
            catalogId: account,
            databaseInput: {
                name: databaseName,
            }
        })
    }

    public getResource():CfnDatabase {
        return this.resource;
    }
}
