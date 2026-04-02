from aws_cdk import CfnOutput, Stack
from constructs import Construct

from infra.constructs import ReferenceShareTable


class MatomeruBoardStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        reference_share_table = ReferenceShareTable(self, "ReferenceShareTable")

        CfnOutput(
            self,
            "ReferenceShareTableName",
            value=reference_share_table.table.table_name,
            description="DynamoDB table for lists and videos.",
        )
