import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import "../tasks/deploy";
import { config } from "dotenv";

import fs from "fs";

config();

task("deploy", "Deploys the contract")
    .addParam("tokenname", "Token name")
    .addParam("tokensymbol", "Token symbol")
    .setAction(async (taskArgs: TaskArguments, hre) => {

        if (!taskArgs.tokenname || !taskArgs.tokensymbol) {
            throw new Error("You must specify the token name and symbol");
        }

        if (!hre.hardhatArguments.network) {
            throw new Error("You must specify the network");
        }

        const recipientAddress = process.env.RECIPIENT_ADDRESS;

        if (!recipientAddress) {
            throw new Error("You must specify the recipient address");
        }

        const contractFactory = await hre.ethers.getContractFactory("Token");
        console.log("Deploying contract with name:", taskArgs.tokenname, "and symbol:", taskArgs.tokensymbol);

        // Start timing
        console.log("Tx initiated at:", new Date().toLocaleTimeString());
        console.log("Tx initiated in epoch milliseconds:", Date.now());
        const contract = await contractFactory.deploy(taskArgs.tokenname, taskArgs.tokensymbol, recipientAddress);
        console.log("deploy tx initiated at:", new Date().toLocaleTimeString());

        console.time("Deployment Time");
        await contract.waitForDeployment();
        // End timing
        console.timeEnd("Deployment Time");
        console.log("Current time at end:", new Date().toLocaleTimeString());
        console.log("Current time in epoch milliseconds:", Date.now());
        console.log("Contract deployed to:", await contract.getAddress());

        const contractAddress = await contract.getAddress();
        const contractName = taskArgs.tokenname;
        const contractSymbol = taskArgs.tokensymbol;

        const contractData = {
            network: hre.hardhatArguments.network,
            address: contractAddress,
            name: contractName,
            symbol: contractSymbol
        };

        const filePath = "contractData.json";

        let existingData: any[] = [];

        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, "utf-8");
            existingData = JSON.parse(fileContents);
        }

        existingData.push(contractData);

        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    });
