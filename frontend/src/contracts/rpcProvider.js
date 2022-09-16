import {ethers} from "ethers";
import {CHAIN} from "../constants";

export const rpcProvider = ethers.getDefaultProvider(CHAIN.id);
