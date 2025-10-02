import { User } from "../models/user.model";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";
import { Category } from "../models/category.model.js";


const addExpense = AsyncHandler(async(req, res) => {
    const {amount, description, category, paymentMethod} = req.body 
    if(!amount || !description || !category || !paymentMethod){
        throw new ApiError(401, "all fields are mandatory to fill")
    }
    try {
        
        const addedExpense = await Expense.create(
            {
                paidBy : req.user?._id,
                amount : amount,
                description : description,
                category : category,
                paymentMethod : paymentMethod,
                expenseDate : Date.now(),
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

const RemoveExpense = AsyncHandler(async(req, res) => {
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


