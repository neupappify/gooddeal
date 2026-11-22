import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Ruler } from "lucide-react";
import { cn } from "@neup/core/utils";
import type { PropertyCardDetails } from "@/components/propertyCardDetails";

interface PropertyCardProps {
  slug: string;
  title: string;
  price: string;
  location: string;
  image: string;
  purpose: string;
  details?: PropertyCardDetails;
  showAgent?: boolean;
  agent?: {
    name: string;
    image: string;
  };
  className?: string;
}

const PropertyCard = ({
  slug,
  title,
  price,
  location,
  image,
  purpose,
  details,
  showAgent = true,
  agent = {
    name: "Mukti Nath Nepal",
    image: "/hero.png" // default placeholder
  },
  className,
}: PropertyCardProps) => {
  return (
    <Link href={`/properties/${slug}`} className={cn("card-premium group h-full overflow-hidden flex flex-col", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-platinum">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {purpose && (
          <div className="absolute top-4 left-4 z-10">
            <span className="trust-badge shadow-md">{purpose}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-1">
          <p className="text-xl font-semibold text-russian-purple mb-1.5">{price}</p>
          <h3 className="property-card-title font-serif leading-tight text-charcoal group-hover:text-russian-purple transition-colors mb-1.5">
            {title}
          </h3>
          <p className="mb-1 pb-2 text-sm text-warm-gray">At {location}</p>

          {showAgent && (
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-platinum relative">
                 <Image 
                  src={agent.image} 
                  alt={agent.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-warm-gray">Listed by <span className="text-charcoal font-medium">{agent.name}</span></span>
            </div>
          )}
        </div>

        {(details?.bedrooms || details?.bathrooms || details?.area) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-platinum pt-2 text-sm text-charcoal/80">
            {details.bedrooms && <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-warm-gray" />{details.bedrooms} beds</span>}
            {details.bathrooms && <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4 text-warm-gray" />{details.bathrooms} baths</span>}
            {details.area && <span className="inline-flex items-center gap-1.5"><Ruler className="h-4 w-4 text-warm-gray" />{details.area}</span>}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
