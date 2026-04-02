#!/usr/bin/env python3

import aws_cdk as cdk

from infra.stacks import MatomeruBoardStack


app = cdk.App()
MatomeruBoardStack(app, "MatomeruBoardStack")

app.synth()
