"use client";

import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import { useDeleteProductFromCatalogMutation, useGetProductsFromCatalogQuery } from "@/src/redux/api/catalogueApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { Product } from "@/src/types/components/catalogue";
import { Column } from "@/src/types/shared";
import { Edit2, Package, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/src/redux/hooks";
import { setEditingProduct } from "@/src/redux/reducers/catalogueSlice";
import useDebounce from "@/src/utils/hooks/useDebounce";

const ManageProducts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catalogId = searchParams.get("catalog_id");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteProductInfo, setDeleteProductInfo] = useState<{ id: string; name: string } | null>(null);

  const {
    data: productsResult,
    isLoading,
    refetch,
    isFetching,
    error: queryError,
  } = useGetProductsFromCatalogQuery(
    {
      catalog_id: catalogId!,
      page,
      limit,
      search: debouncedSearchTerm,
    },
    { skip: !catalogId }
  );

  const dispatch = useAppDispatch();

  // Handle query error
  useEffect(() => {
    if (queryError) {
      const err = queryError as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "Failed to fetch products");
    }
  }, [queryError]);

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductFromCatalogMutation();

  const products: Product[] = productsResult?.data?.products || [];
  const totalCount = productsResult?.data?.pagination?.total || 0;

  const columns: Column<Product>[] = [
    {
      header: "Product Details",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4 py-1">
          <div className="relative group/img h-12 w-12 min-w-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 dark:border-(--card-border-color) flex items-center justify-center transition-transform hover:scale-105">
            {row.image_urls?.[0] ? (
              <Image src={row.image_urls[0]} alt={row.name} className="h-full w-full object-cover" width={100} height={100} unoptimized />
            ) : (
              <Package size={22} className="text-slate-300" />
            )}
            <div className="absolute inset-0 bg-black/5 group-hover/img:bg-transparent transition-colors" />
          </div>
          <div className="flex flex-col gap-0.5 max-w-50 sm:max-w-75">
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{row.name}</span>
            <span className="text-[11px] text-slate-500 line-clamp-1">{row.description || "No description provided"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Pricing",
      accessorKey: "price",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-sky-400">
            {typeof row.price === "string" ? row.price : `${row.currency} ${(row.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          </span>
          {row.sale_price && Number(row.sale_price) < Number(row.price) && (
            <span className="text-[10px] text-slate-400 line-through">
              {typeof row.sale_price === "string" ? row.sale_price : `${row.currency} ${(row.sale_price / 100).toLocaleString()}`}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "availability",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${row.availability === "in stock" ? "bg-sky-500 animate-pulse" : "bg-slate-300"}`} />
          <Badge 
            variant="outline" 
            className={`capitalize text-[10px] font-bold border-none px-2 py-0 h-5 ${
              row.availability === "in stock" 
                ? "bg-sky-50 text-primary dark:bg-sky-900/20 dark:text-sky-400" 
                : "bg-slate-100 text-slate-600 dark:bg-(--dark-body) dark:text-gray-500"
            }`}
          >
            {row.availability}
          </Badge>
        </div>
      ),
    },
    {
      header: "Retailer ID",
      accessorKey: "retailer_id",
      cell: (row) => (
        <code className="text-[10px] font-mono bg-slate-100 dark:bg-(--dark-body) px-2 py-1 rounded text-slate-500 dark:text-gray-500 uppercase tracking-tighter">
          {row.retailer_id}
        </code>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex justify-end gap-2 pr-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg bg-slate-50 hover:bg-primary/10 text-slate-400 dark:bg-(--table-hover) dark:border-none hover:text-primary transition-all duration-300 border border-slate-100/50"
            onClick={() => {
              dispatch(setEditingProduct(row));
              router.push(`/catalogues/manage/edit/${row.product_external_id}?catalog_id=${catalogId}`);
            }}
            title="Edit Product"
          >
            <Edit2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-lg bg-red-50/50 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-300 border border-red-100/30 dark:hover:bg-red-900/20 dark:bg-red-900/10 dark:border-none" 
            onClick={() => setDeleteProductInfo({ id: row.product_external_id, name: row.name })} 
            title="Delete Product"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (deleteProductInfo && catalogId) {
      try {
        await deleteProduct({
          catalog_id: catalogId,
          product_id: deleteProductInfo.id,
        }).unwrap();
        toast.success("Product deleted successfully");
        setDeleteProductInfo(null);
      } catch (error: unknown) {
        const fetchError = error as { data?: { message?: string } };
        toast.error(fetchError?.data?.message || "Failed to delete product");
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Products refreshed");
  };

  if (!catalogId) {
    return (
      <div className="p-8 text-center py-20">
        <h3 className="text-lg font-semibold">No Catalogue Selected</h3>
        <p className="text-gray-500">Please select a catalogue from the main page to manage products.</p>
        <Button onClick={() => router.push("/catalogues")} className="mt-4">
          Back to Catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="sm:p-8 p-4 space-y-8">
      <CommonHeader
        title="Manage Products"
        description="View and manage products in your linked catalogue"
        onSearch={handleSearch}
        searchTerm={searchTerm}
        searchPlaceholder="Search products..."
        onRefresh={handleRefresh}
        onAddClick={() => {
          router.push(`/catalogues/manage/add?catalog_id=${catalogId}`);
        }}
        addLabel="Add Product"
        isLoading={isLoading}
        backBtn
      />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden dark:bg-(--card-color) dark:border-(--card-border-color)">
        <DataTable data={products} columns={columns} isLoading={isLoading} isFetching={isFetching} totalCount={totalCount} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} getRowId={(item) => item._id} emptyMessage={searchTerm ? `No products found matching "${searchTerm}"` : "No products in this catalogue yet."} className="border-none shadow-none rounded-none" />
      </div>

      <ConfirmModal isOpen={!!deleteProductInfo} onClose={() => setDeleteProductInfo(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Product" subtitle={`Are you sure you want to delete "${deleteProductInfo?.name}"? This action will permanently remove the product from your Facebook catalogue.`} confirmText="Delete" variant="danger" />
    </div>
  );
};

export default ManageProducts;
