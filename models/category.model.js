import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String, // For Flutter icons (e.g., "food", "transport", "shopping")
        required: false
    },
    color: {
        type: String, // Hex color code for UI
        required: true,
        default: "#6366f1"
    },
    keywords: [{
        type: String,
        lowercase: true
    }], // For auto-categorization
    isDefault: {
        type: Boolean,
        default: false // System predefined categories
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false // null for default categories
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: false // For subcategories
    }
}, { timestamps: true });

// default categories array to suggest categories
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

// Auto-categorize based on description by looping through it for finding keywords
categorySchema.statics.suggestCategory = async function(description) {
    if (!description) return null;
    
    const categories = await this.find({ isDefault: true });
    const desc = description.toLowerCase();
    
    for (const category of categories) {
        for (const keyword of category.keywords) {
            if (desc.includes(keyword)) {
                return category._id;
            }
        }
    }
    
    // Return "Other" category if no match
    const otherCategory = await this.findOne({ name: "Other", isDefault: true });
    return otherCategory ? otherCategory._id : null;
};

export const Category = mongoose.model("Category", categorySchema);
