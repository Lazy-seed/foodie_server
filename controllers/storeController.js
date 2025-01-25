import storeData from "../models/StoreModel.js"

export const getStores = async (req, res) => {
const storeList = storeData
res.status(200).json(storeList)

}