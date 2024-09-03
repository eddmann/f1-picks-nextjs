#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { F1PicksNextJsStack } from "../lib/f1-picks-nextjs-stack";

const app = new cdk.App();
new F1PicksNextJsStack(app, "F1PicksNextJsStack", {});
