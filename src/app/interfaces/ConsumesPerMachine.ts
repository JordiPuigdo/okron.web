import { Asset } from "./Asset";

export interface ConsumesPerAsset {
    asset : Asset
    spareParts : AssetSparePart[]
}

interface AssetSparePart {
    quantity: number;
    creationDate : string;
}