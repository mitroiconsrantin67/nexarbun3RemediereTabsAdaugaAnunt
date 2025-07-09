import React from 'react';
import { Store, Clock } from 'lucide-react';

interface Listing {
  seller: {
    type: string;
  };
  availability: string;
}

interface ListingDetailPageProps {
  listing: Listing;
}

const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listing }) => {
  return (
    <div>
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
    </div>
  );
};

export default ListingDetailPage;