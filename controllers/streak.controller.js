import { Streak } from "../models/streak.model.js";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";


const areDatesWithin48Hours = (date1, date2) => {
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const timeDifference = date1.getTime() - date2.getTime();
    return Math.abs(timeDifference) < twoDays;
};

const updateUserStreak = AsyncHandler(async(req, res) => {
    const userId = req.user._id;
    const today = new Date();
    
  try {
      // Get user's streak and last expense
      let streak = await Streak.findOne({ owner: userId });
      const lastExpense = await Expense.findOne({ paidBy: userId })
          .sort({ expenseDate: -1 });  //gets the lastest expense date
      
      if (!streak) {
          streak = await Streak.create({
              owner: userId,
              currentStreak: 1,
              maxStreak: 1
          });
      } else if (lastExpense) {
          if (areDatesWithin48Hours(today, lastExpense.expenseDate)) {
              // Continue streak - user is active
              streak.currentStreak += 1;
              streak.maxStreak = Math.max(streak.maxStreak, streak.currentStreak);
          } else {
              // Break streak - gap too long
              streak.currentStreak = 1;
          }
          await streak.save();
      }
      
      return res.status(200).json(new ApiResponse(200, streak, "Streak updated successfully"));
  } catch (error) {
       throw new ApiError(500, error ? error : "error in udating streak properly")
  }
});


const getCurrentStreak = AsyncHandler(async(req, res) =>{
    const userId = req.user?._id;
    const streak = await Streak.findOne({ owner: userId });
    if(!streak){
        return res.status(200).json(new ApiResponse(200, {
            currentStreak : 0,
            maxStreak : 0,
        }));
    }
 return res.status(200).json(new ApiResponse(200, streak, "Streak data retrieved"));
})

export {
     updateUserStreak, 
     getCurrentStreak };