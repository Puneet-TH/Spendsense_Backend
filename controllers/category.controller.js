import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";

// Function to insert default categories in category DB
export const seedCategories = async () => {
    try {
        const existingCategories = await Category.find({ isDefault: true });
        if (existingCategories.length > 0) {
            console.log("Default categories already exist.");
            return;
        }

        const defaultCategories = [
            {
                name: "Food & Dining",
                icon: "restaurant",
                color: "#ef4444",
                keywords: ["restaurant", "food", "dinner", "lunch", "breakfast", "cafe", "pizza", "burger", "swiggy", "zomato", "dominos"],
                isDefault: true
            },
            {
                name: "Transportation",
                icon: "directions_car",
                color: "#3b82f6",
                keywords: ["uber", "ola", "taxi", "bus", "metro", "fuel", "petrol", "diesel", "parking", "auto"],
                isDefault: true
            },
            {
                name: "Shopping",
                icon: "shopping_bag",
                color: "#8b5cf6",
                keywords: ["amazon", "flipkart", "myntra", "clothes", "shopping", "mall", "store", "buy"],
                isDefault: true
            },
            {
                name: "Entertainment",
                icon: "movie",
                color: "#f59e0b",
                keywords: ["movie", "cinema", "netflix", "spotify", "game", "concert", "party", "club"],
                isDefault: true
            },
            {
                name: "Healthcare",
                icon: "local_hospital",
                color: "#10b981",
                keywords: ["doctor", "medicine", "hospital", "pharmacy", "medical", "health", "clinic"],
                isDefault: true
            },
            {
                name: "Utilities",
                icon: "flash_on",
                color: "#f97316",
                keywords: ["electricity", "water", "gas", "internet", "phone", "bill", "recharge"],
                isDefault: true
            },
            {
                name: "Education",
                icon: "school",
                color: "#06b6d4",
                keywords: ["course", "book", "education", "school", "college", "fees", "udemy", "learning"],
                isDefault: true
            },
            {
                name: "Travel",
                icon: "flight",
                color: "#84cc16",
                keywords: ["flight", "hotel", "travel", "vacation", "trip", "booking", "makemytrip"],
                isDefault: true
            },
            {
                name: "Groceries",
                icon: "local_grocery_store",
                color: "#22c55e",
                keywords: ["grocery", "vegetables", "fruits", "milk", "bread", "supermarket", "bigbasket"],
                isDefault: true
            },
            {
                name: "Other",
                icon: "category",
                color: "#6b7280",
                keywords: [],
                isDefault: true
            }
        ];

        await Category.insertMany(defaultCategories);
    } catch (error) {
       throw new ApiError(401, "unable to categorize try later")
    }
};
