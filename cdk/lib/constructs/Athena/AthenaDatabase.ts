import { Construct } from "constructs";
import { CfnDatabase } from "aws-cdk-lib/aws-glue";

type AthenaDatabaseProps = {
  account: string;
  databaseName: string;
};

export class AthenaDatabase extends CfnDatabase {
  constructor(scope: Construct, id: string, props: AthenaDatabaseProps) {
    const { account, databaseName } = props;

    super(scope, id, {
      catalogId: account,
      databaseInput: {
        name: databaseName,
      },
    });
  }
}
