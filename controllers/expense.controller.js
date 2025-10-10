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

const removeExpense = AsyncHandler(async(req, res) => {
      const {expenseId} = req.params 
      if(!expenseId){
        throw new ApiError(401, "no expenseId found in params")
      }
    try {
          const expenseFound  = await Expense.findById(expenseId)
          if(!expenseFound){
             throw new ApiError("no expense founded in the db")
          }
         const deletedExpense = await Expense.findOneAndDelete({expenseId : expenseId})
         if(!deletedExpense){
            throw new ApiError("failed to delete expense try again later")
         }
         return res.status(200).json(new ApiError(200,deletedExpense,"expense deleted successfully"))
    } catch (error) {
        throw new ApiError(401, error? error : "delete failed retry again after some time")
    }
})


//updateExpense , //sumofallexpense , mostFrequentExpense, categorywiseSpending 
const updateExpense = AsyncHandler(async(req, res) => {
       const {amount, description, category, paymentMethod, tags} = req.body 
        if(!amount || !description || !category || !paymentMethod){
            throw new ApiError(401, "all fields are mandatory to fill")
        }
        if (!Array.isArray(tags) || !tags.every(tag => typeof tag === "string")) {
        throw new ApiError(400, "Tags must be an array of strings");
    }

       const {expenseId} = req.params
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
        const updatedExpense = await Expense.findByIdAndUpdate({expenseId}, 
            {
                $set:{
                paidBy,
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
               .json(new ApiError(200, updatedExpense, "Expense updated successfully"))

     } catch (error) {
        throw new ApiError(501, `update is not available currently and this is the problem : ${error}`)
     }
})


//trying pagination
const getallExpense = AsyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

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

const getMonthlyCategorySpending = AsyncHandler(async(req, res) => {
        const userId = req.user._id; 
        const { month, year } = req.query;

        if (!month || !year) {
        return res.status(400).json(new ApiError({
            success: false,
            message: "Month and year are required",
              }) );
        }
  try {
        const spending = await Expense.getMonthlyCategorySpending(userId, parseInt(month), parseInt(year));
        res.status(200).json(new ApiResponse(200, spending, "Category spending fetched successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, {
        success: false,
        message: "Failed to fetch monthly category spending",
        error: error.message,
        },"unable to fetch spending try again later"));
    }
});

const getTotalExpenseOfUser = AsyncHandler(async(req, res) => {
     const {userId} = req.user?._id || req.params;
     if(!userId) {
        throw new ApiError(401, "no Id is present login first or provide through params")
     }
     
    try {
        const totalAmountSpended = await Expense.aggregate([
            {
            $group : {
                _id : "$paidBy",
                totalSpend : {
                    $sum : "$amount"
                } ,
            }
            }
        ])
        
        if(!totalAmountSpended){
            throw new ApiError(401, "unable to fetch total amount spend by the user")
        }
    
        return res.status(200).json(
            new ApiResponse(
                200,
                totalAmountSpended,
                "total amount spend by the current user fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(`unable to fetch current user total spend :: ${error}`)
    }
})


// Expense Insights and Analytics , most occuring expense //recurring expense update


export{
    addExpense,
    removeExpense,
    updateExpense
}

