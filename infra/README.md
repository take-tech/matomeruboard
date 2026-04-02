# Matomeruboard CDK

Python CDK app for the MVP infrastructure.

## Included resources

- `MatomeruBoardStack`
- DynamoDB table for reference-share lists and videos

## Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Useful commands

```bash
cdk ls
cdk synth
cdk diff
cdk deploy
pytest
```

## DynamoDB access pattern

This stack creates a single table intended for the MVP's main access patterns.

- `list_id = LIST#{list_id}`
- `item_key = META` for the list item
- `item_key = VIDEO#{sort_order}#{video_id}` for video items

This supports:

- fetching one list and its videos with a single partition query
- maintaining video display order with `sort_order`
