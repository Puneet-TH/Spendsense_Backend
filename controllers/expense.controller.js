import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";
import { Category } from "../models/category.model.js";
import mongoose, { Mongoose, 
    isValidObjectId } from "mongoose";

const addExpense = AsyncHandler(async(req, res) => {
    const {amount, description, category, paymentMethod, tags} = req.body 
    if(!amount || !description || !category || !paymentMethod){
        throw new ApiError(401, "all fields are mandatory to fill")
    }
    if (!Array.isArray(tags) || !tags.every(tag => typeof tag === "string")) {
        throw new ApiError(400, "Tags must be an array of strings");
    }

    try {
        let categoryNew = await Category.findOne({ name: category });

        // If the category doesn't exist, create it dynamically as it will be stored in the collection of category db.
        if (!categoryNew) {
            categoryNew = new Category({ name: category, isDefault: false, keywords: tags });
            await categoryNew.save();
        }
        
        const addedExpense = await Expense.create(
            {
                paidBy : req.user?._id,
                amount : amount || null,
                description : description || null,
                category : categoryNew?._id || null,
                paymentMethod : paymentMethod,
                expenseDate : Date.now(),
                tags : tags,
            }
        )
        
        if(!addedExpense){
            throw new ApiError(401, "unable to add expense try again later")
        }
    
        return res
                .status(200)
                .json(new ApiResponse(200, addedExpense, "expense added successfully"))
    } catch (error) {
        throw new ApiError(501, error? error : "server is down unable to add expense try again later")  
    } 
})

const removeExpense = AsyncHandler(async (req, res) => {
    // Accept expenseId from params, query or body for flexibility
    const expenseId = req.params?.expenseId || req.query?.expenseId || req.body?.expenseId;

    if (!expenseId) {
        throw new ApiError(400, "No expenseId provided. Provide expenseId as route param, query or body.");
    }

    if (!isValidObjectId(expenseId)) {
        throw new ApiError(400, "Invalid expenseId format");
    }

    try {
        const expenseFound = await Expense.findById(expenseId);
        if (!expenseFound) {
            return res.status(404).json(new ApiResponse(404, null, "Expense not found"));
        }

        const deletedExpense = await Expense.findByIdAndDelete(expenseId);
        if (!deletedExpense) {
            throw new ApiError(500, "Failed to delete expense. Try again later.");
        }

        return res.status(200).json(new ApiResponse(200, deletedExpense, "Expense deleted successfully"));
    } catch (error) {
        console.error("removeExpense error:", error);
        throw new ApiError(500, error?.message || "Delete failed. Retry again after some time");
    }
});


//updateExpense , //sumofallexpense , mostFrequentExpense, categorywiseSpending 
const updateExpense = AsyncHandler(async(req, res) => {
       const {amount, description, category, paymentMethod, tags} = req.body 
        if(!amount || !description || !category || !paymentMethod){
            throw new ApiError(401, "all fields are mandatory to fill")
        }
        if (!Array.isArray(tags) || !tags.every(tag => typeof tag === "string")) {
        throw new ApiError(400, "Tags must be an array of strings");
    }

        const expenseId = req.params?.expenseId || req.query?.expenseId || req.body?.expenseId;
        if(!expenseId){
            throw new ApiError(401, "no expense Id in params")
        }
        try {
            
       const findExpense = await Expense.findById(expenseId);
        if(!findExpense){
            return res.status(200).json(new ApiResponse(200, "no expense found"));
         }

        let categoryNew = await Category.findOne({ name: category });

        // If the category doesn't exist, create it dynamically as it will be stored in the collection of category db.
        if (!categoryNew) {
            categoryNew = new Category({ name: category, isDefault: false, keywords: tags });
            await categoryNew.save();
        }
        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, 
            {
                $set:{
                paidBy : req.user?._id || null,
                amount : amount,
                description : description,
                category : categoryNew?._id || null,
                paymentMethod : paymentMethod,
                tags : tags,
                }
            },{
                new : true
            }
          )
         if(!updatedExpense){
            throw new ApiError(401, "unable to update expense try again later")
          }

        return res
               .status(200)
               .json(new ApiResponse(200, updatedExpense, "Expense updated successfully"))

     } catch (error) {
        throw new ApiError(501, `update is not available currently and this is the problem : ${error}`)
     }
})


//trying pagination
const getallExpense = AsyncHandler(async(req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", userId } = req.query

    if(!userId){     //if present or not
        throw new ApiError(401, "userId is not present")
    }
    
    if(!userId || !isValidObjectId(userId)){   //for type checking
        throw new ApiError(401, "invalid userId format")
    }

    const validSortFields = ["createdAt", "amount", "paymentMethod"];
    if (!validSortFields.includes(sortBy)) {
    throw new ApiError(400, `Invalid sortBy field. Valid options: ${validSortFields.join(", ")}`);
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        pagination: true
    }
    try {
        const allExpense = await Expense.aggregatePaginate([
            {
                $match : {paidBy : new mongoose.Types.ObjectId(userId)}
            } , 
            {
                $lookup : {
                    from : "users",
                    localField : "paidBy",
                    foreignField: "_id",
                    as : "expenseData"
                }, 
            }, 
            {
                $addFields : {
                    expenseData : "$expenseData"
                }
            },
            {
            $sort: {
                [sortBy]: sortType.toLowerCase() === "asc" ? 1 : -1
            }
            },
            {
                $project : {
                    amount : 1,
                    paidBy : 1,
                    paymentMethod : 1,
                    expenseData: 1,
                }
            }
        ], options)
        
        res.status(200).json(
            new ApiResponse(
                200,
                allExpense,
                "allExpense fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(`error in the Db try again later :: ${error}`)
    }
})


//monthly and yearly
const getMonthlyCategorySpending = AsyncHandler(async(req, res) => {
        const userId = req.user._id; 
         if(!userId) {
            throw new ApiError(401, "user not logged in try again later")
          }
        const { month, year } = req.query;

        if (!month || !year) {
        return res.status(400).json(new ApiResponse(400, {
            success: false,
            message: "Month and year are required",
              }) );
        }
  try {
        const spending = await Expense.getMonthlyCategorySpending(userId, parseInt(month), parseInt(year));
        if(!spending){
            throw new ApiError(500, "error in fetching spending from db try again later")
        }
        res.status(200).json(new ApiResponse(200, spending, "Category spending fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, {
        success: false,
        message: "Failed to fetch monthly category spending",
        error: error.message,
        },"unable to fetch spending try again later"));
    }
});


//can add pagination for every category when processing a large amount of data will help later.
const getYearlyCategorySpending = AsyncHandler(async(req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Please login to access this resource");
    }

    const { year } = req.query;
    if (!year || isNaN(year)) {
        throw new ApiError(400, "Please provide a valid year");
    }

    const parsedYear = parseInt(year);
    const currentYear = new Date().getFullYear();
    
    if (parsedYear > currentYear) {
        throw new ApiError(400, "Cannot fetch data for future years");
    }

    try {
        const yearlySpending = await Expense.getYearlyCategorySpending(userId, parsedYear);
        
        if (!yearlySpending || yearlySpending.length === 0) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        year: parsedYear,
                        categories: [],
                        totalAmount: 0
                    },
                    "No expenses found for the specified year"
                )
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    yearlySpending
                },
                "Yearly category spending fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Failed to fetch yearly spending data"
        );
    }
})


//checked./
const getTotalExpenseOfUser = AsyncHandler(async (req, res) => {
  // Prefer authenticated id.
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "No user id. Login or provide userId in params/query.");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId format");
  }

  try {
    const result = await Expense.aggregate([
      { $match: { paidBy: new mongoose.Types.ObjectId(userId) } }, // filter by user
      { $group: { _id: "$paidBy", totalSpend: { $sum: "$amount" } } }
    ]);
    
    if(!result){
        throw new ApiError(500, "problem in getting total expense server busy")
    }

    const totalSpend = (result[0] && result[0].totalSpend) ? result[0].totalSpend : 0;

    return res.status(200).json(new ApiResponse(200, { totalSpend}, "Total spend fetched successfully"));
  } catch (err) {
    throw new ApiError(500, "Unable to fetch total spend. Try again later.");
  }
});



// Expense Insights and Analytics , most occuring expense //recurring expense update


export{
    addExpense,
    removeExpense,
    updateExpense,
    getallExpense,
    getMonthlyCategorySpending,
    getYearlyCategorySpending,
    getTotalExpenseOfUser
}

