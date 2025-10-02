import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
import { Category } from "./category.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const expenseSchema = new Schema (
    {
        paidBy : {
            type : mongoose.Types.ObjectId,
            ref : "User",
            required: true
        },
        amount : {
            type : Number,
            required : true,
            min: [0, 'Amount cannot be negative']
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: "Category",
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'upi', 'netbanking', 'wallet'],
            default: 'cash'
        },

        isRecurring: {
            type: Boolean,
            default: false
        },
        recurringFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            required: function() { return this.isRecurring; }
        },
        tags: [{
            type: String,
            lowercase: true,
            trim: true
        }],
        notes: {
            type: String,
            maxlength: [500, 'Notes too long']
        },
        expenseDate: {
            type: Date,
            default: Date.now,
            required: true
        }
    }, {timestamps : true}
);

// Auto-categorize before saving
expenseSchema.pre('save', async function(next) {
    if (this.isNew && this.description && !this.category) {
        try {
            const suggestedCategory = await Category.suggestCategory(this.description);
            if (suggestedCategory) {
                this.category = suggestedCategory;
            }
        } catch (error) {
            console.log('Auto-categorization failed:', error);
        }
    }
    next();
});

// Method to get monthly spending by category
expenseSchema.statics.getMonthlyCategorySpending = async function(userId, month, year) {
    return await this.aggregate([
        {
            $match: {
                paidBy: new mongoose.Types.ObjectId(userId),
                $expr: {
                    $and: [
                        { $eq: [{ $month: "$expenseDate" }, month] },
                        { $eq: [{ $year: "$expenseDate" }, year] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$category",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryInfo"
            }
        },
        {
            $unwind: "$categoryInfo"
        },
        {
            $project: {
                categoryName: "$categoryInfo.name",
                categoryIcon: "$categoryInfo.icon",
                categoryColor: "$categoryInfo.color",
                totalAmount: 1,
                count: 1
            }
        },
        {
            $sort: { totalAmount: -1 }
        }
    ]);
};

expenseSchema.plugin(mongooseAggregatePaginate)

export const Expense = mongoose.model("Expense", expenseSchema);