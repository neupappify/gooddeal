import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { getPropertyCardDetails } from "@/components/propertyCardDetails";
import { formatListingPrice } from "@/components/formatListingPrice";
import Link from "next/link";
import { listEstateListings } from "@neup/logica/estate/listings/list";
import { Search } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties, Good Deal",
  description: "Browse our curated list of legally verified properties in Kathmandu and Lalitpur.",
};

const GOODDEAL_AGENCY_ID = "e432db37-4d83-452e-bd89-d269fd9314e4";
const LISTINGS_PER_PAGE = 16;

interface PropertiesPageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

// Build pagination links without dropping the active search query.
function getPageHref(page: number, query?: string): string {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("query", query);
  return `/properties?${params.toString()}`;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const { query, page: requestedPage } = await searchParams;
  const searchTerm = query?.trim();
  const parsedPage = Number(requestedPage);
  const currentPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const offset = (currentPage - 1) * LISTINGS_PER_PAGE;
  const response = await listEstateListings({
    agencyId: GOODDEAL_AGENCY_ID,
    filter: { status: "active", ...(searchTerm ? { searchTerm } : {}) },
    fields: ["slug", "title", "price", "location", "purpose", "category", "types", "images", "area", "areaUnit", "listings.spacing", "listings.details"],
    limit: LISTINGS_PER_PAGE,
    offset,
  });
  const properties = response.ok && Array.isArray(response.body.listings)
    ? response.body.listings.flatMap((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
        const property = entry as Record<string, unknown>;
        const priceRecord = property.price && typeof property.price === "object"
          ? property.price as Record<string, unknown>
          : {};
        const amount = typeof priceRecord.amount === "number" ? priceRecord.amount : null;
        const price = formatListingPrice(amount);
        const location = property.location;
        const locationText = typeof location === "string"
          ? location
          : location && typeof location === "object" && "text" in location && typeof location.text === "string"
            ? location.text
            : "Location available on request";
        const images = Array.isArray(property.images) ? property.images : [];
        const firstImage = images[0];
        const image = typeof firstImage === "string"
          ? firstImage
          : firstImage && typeof firstImage === "object" && "url" in firstImage && typeof firstImage.url === "string"
            ? firstImage.url
            : "/hero.png";
        const propertySlug = typeof property.slug === "string" ? property.slug : "property";
        if (!propertySlug) return [];

        return [{
          slug: propertySlug,
          title: typeof property.title === "string" && property.title.trim()
            ? property.title
            : "Property listing",
          price,
          location: locationText,
          purpose: typeof property.purpose === "string"
            ? property.purpose
            : Array.isArray(property.purpose) && typeof property.purpose[0] === "string"
              ? property.purpose[0]
              : "",
          details: getPropertyCardDetails(property),
          image,
        }];
      })
    : [];
  const totalCount = response.ok && typeof response.body.totalCount === "number"
    ? response.body.totalCount
    : undefined;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = totalCount !== undefined
    ? offset + properties.length < totalCount
    : properties.length === LISTINGS_PER_PAGE;

  return (
    <div className="min-h-screen flex flex-col ">
      <Header />
      
      <main className="flex-grow">
        <section className="border-b border-slate-200/80 bg-slate-50/70 pt-32 pb-10 sm:pt-36">
          <div className="container mx-auto max-w-[1440px] px-6 lg:px-8">
            <div className="flex flex-col items-start gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-russian-purple">Good Deal verified listings</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Find a property that fits.</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Browse properties reviewed by our advisory team and get clear details before you take the next step.
                </p>
              </div>
              <form action="/properties" method="GET" className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-russian-purple/40">
                <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  name="query"
                  defaultValue={query}
                  placeholder="Search location, type, or price"
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button type="submit" className="rounded-xl bg-russian-purple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#251138]">
                  Search
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-14">
          <div className="container mx-auto max-w-[1440px] px-6 lg:px-8">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {properties.map((property) => (
                  <PropertyCard key={property.slug} {...property} showAgent={false} className="h-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-russian-purple shadow-sm"><Search className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">No properties found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {query ? `No properties matched “${query}”. Try another search.` : "There are no listings available right now."}
                </p>
              </div>
            )}
            {(hasPreviousPage || hasNextPage) && (
              <nav aria-label="Property pages" className="mt-8 flex items-center justify-center gap-4">
                {hasPreviousPage ? (
                  <Link href={getPageHref(currentPage - 1, searchTerm)} className="rounded-lg border border-platinum px-4 py-2 text-sm font-medium text-charcoal hover:border-russian-purple hover:text-russian-purple">
                    Previous
                  </Link>
                ) : <span />}
                <span className="text-sm text-warm-gray">Page {currentPage}</span>
                {hasNextPage ? (
                  <Link href={getPageHref(currentPage + 1, searchTerm)} className="rounded-lg border border-platinum px-4 py-2 text-sm font-medium text-charcoal hover:border-russian-purple hover:text-russian-purple">
                    Next
                  </Link>
                ) : <span />}
              </nav>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
