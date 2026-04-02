import aws_cdk as core
import aws_cdk.assertions as assertions

from infra.stacks import MatomeruBoardStack


def test_dynamodb_table_created_for_reference_share() -> None:
    app = core.App()
    stack = MatomeruBoardStack(app, "test-stack")
    template = assertions.Template.from_stack(stack)

    template.has_resource_properties(
        "AWS::DynamoDB::Table",
        {
            "BillingMode": "PAY_PER_REQUEST",
            "KeySchema": [
                {"AttributeName": "list_id", "KeyType": "HASH"},
                {"AttributeName": "item_key", "KeyType": "RANGE"},
            ],
            "AttributeDefinitions": [
                {"AttributeName": "list_id", "AttributeType": "S"},
                {"AttributeName": "item_key", "AttributeType": "S"},
            ],
            "PointInTimeRecoverySpecification": {
                "PointInTimeRecoveryEnabled": True,
            },
            "TableName": "matomeruboard-reference-share",
        },
    )
