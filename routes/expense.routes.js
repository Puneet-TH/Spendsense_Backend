import { Router } from "express";
import { 
    addExpense,
    removeExpense,
    updateExpense,
    getallExpense,
    getMonthlyCategorySpending,
    getTotalExpenseOfUser
    } from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/Auth.js";

const router = Router()
router.route("/add-expense").post(verifyJWT,addExpense)
router.route("/remove-expense").post(verifyJWT,removeExpense)
router.route("/update-expense").patch(verifyJWT, updateExpense)
//all get routes
router.route("/e/allExpense").get(verifyJWT, getallExpense)
router.route("/m/monthlyCategorySpending").get(verifyJWT, getMonthlyCategorySpending)
router.route("/t/totalExpense").get(verifyJWT, getTotalExpenseOfUser)
export default router 
