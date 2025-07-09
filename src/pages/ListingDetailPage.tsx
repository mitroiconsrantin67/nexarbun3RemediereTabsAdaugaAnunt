Here's the fixed version with the missing closing brackets and corrected syntax:

```javascript
{listing.seller.type === "dealer" && (
    <div className="mb-4 flex justify-start">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
            listing.availability === "pe_stoc" 
                ? "bg-emerald-100 text-emerald-800" 
                : "bg-amber-100 text-amber-800"
        }`}>
            {listing.availability === "pe_stoc" ? (
                <>
                    <Store className="h-4 w-4" />
                    <span className="font-medium">Pe stoc</span>
                </>
            ) : (
                <>
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">La comandă</span>
                </>
            )}
        </div>
    </div>
)}
```

I fixed:
1. Added missing closing brace for the className template literal
2. Added missing closing bracket for the conditional rendering
3. Fixed indentation for better readability

The rest of the fi\le appears to be syntactically correct.
