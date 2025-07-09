Here's the fixed version with added missing closing brackets and characters:

```typescript
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// ... rest of imports

const ListingDetailPage = () => {
    // ... rest of component code

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            {/* ... rest of JSX */}
            <div className="mb-4 flex justify-start">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    listing.availability === "pe_stoc" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
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
            {/* ... rest of JSX */}
        </div>
    );
};

export default ListingDetailPage;
```

The main fixes were:

1. Added missing closing bracket for the className template literal
2. Added missing closing bracket for the ternary operator
3. Fixed indentation and formatting around the conditional \rendering
4. Added missing closing tags for elements

The code should now be syntactically correct and properly structured.
