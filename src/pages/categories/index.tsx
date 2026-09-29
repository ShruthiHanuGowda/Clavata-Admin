import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined
} from '@ant-design/icons';

import { useMutation, useQuery } from '@apollo/client';

import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  GET_CATEGORIES,
  CREATE_SUBCATEGORY,
  UPDATE_SUBCATEGORY,
  DELETE_SUBCATEGORY,
  GET_SUBCATEGORIES,
  GET_BUSINESS_TYPES
} from '../../graphql/queries';

// ======================================================
// TYPES
// ======================================================

type CategoryStatus = 'ACTIVE' | 'INACTIVE';

type SubcategoryStatus = 'ACTIVE' | 'INACTIVE';

type StatusFilter =
  | 'ALL'
  | CategoryStatus;

type ServiceAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

interface BusinessType {
  businessTypeId: string;
  name: string;
  description?: string | null;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  categoryId: string;
  name: string;
  description: string | null;
  servicesCount: number;
  status: CategoryStatus;
  businessTypeIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description: string | null;
  servicesCount: number;
  status: SubcategoryStatus;
  audiences?: ServiceAudience[] | null;
  businessTypeIds?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoryForm {
  name: string;
  description: string;
  status: CategoryStatus;
  businessTypeIds: string[];
}

interface SubcategoryForm {
  categoryId: string;
  name: string;
  description: string;
  status: SubcategoryStatus;
  audiences: ServiceAudience[];
  businessTypeIds: string[];
}

interface GetCategoriesData {
  categories: {
    success: boolean;
    message: string;
    totalCount: number;
    categories: Category[];
  };
}

interface GetSubcategoriesData {
  subcategories: {
    success: boolean;
    message: string;
    totalCount: number;
    subcategories: Subcategory[];
  };
}

interface GetBusinessTypesData {
  businessTypes: {
    success: boolean;
    message: string;
    totalCount: number;
    businessTypes: BusinessType[];
  };
}

interface CreateCategoryData {
  createCategory: {
    success: boolean;
    message: string;
    category: Category | null;
  };
}

interface UpdateCategoryData {
  updateCategory: {
    success: boolean;
    message: string;
    category: Category | null;
  };
}

interface DeleteCategoryData {
  deleteCategory: {
    success: boolean;
    message: string;
    category: Category | null;
  };
}

interface CreateSubcategoryData {
  createSubcategory: {
    success: boolean;
    message: string;
    subcategory: Subcategory | null;
  };
}

interface UpdateSubcategoryData {
  updateSubcategory: {
    success: boolean;
    message: string;
    subcategory: Subcategory | null;
  };
}

interface DeleteSubcategoryData {
  deleteSubcategory: {
    success: boolean;
    message: string;
    subcategory: Subcategory | null;
  };
}

// ======================================================
// DEFAULT FORMS
// ======================================================

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: '',
  description: '',
  status: 'ACTIVE',
  businessTypeIds: []
};

const EMPTY_SUBCATEGORY_FORM: SubcategoryForm = {
  categoryId: '',
  name: '',
  description: '',
  status: 'ACTIVE',
  audiences: [],
  businessTypeIds: []
};

// ======================================================
// AUDIENCE OPTIONS
// ======================================================

const AUDIENCE_OPTIONS: Array<{
  value: ServiceAudience;
  label: string;
}> = [
  {
    value: 'FEMALE',
    label: 'Female'
  },
  {
    value: 'MALE',
    label: 'Male'
  },
  {
    value: 'KIDS',
    label: 'Kids'
  }
];

// ======================================================
// COMPONENT
// ======================================================

export default function Categories() {
  // ====================================================
  // CATEGORY UI STATE
  // ====================================================

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [page, setPage] =
    useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [
    openCategoryDialog,
    setOpenCategoryDialog
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory
  ] = useState<Category | null>(null);

  const [
    categoryForm,
    setCategoryForm
  ] = useState<CategoryForm>(
    EMPTY_CATEGORY_FORM
  );

  const [
    deleteCategoryDialog,
    setDeleteCategoryDialog
  ] = useState(false);

  const [
    categoryToDelete,
    setCategoryToDelete
  ] = useState<Category | null>(null);

  // ====================================================
  // SUBCATEGORY UI STATE
  // ====================================================

  const [
    openSubcategoryDialog,
    setOpenSubcategoryDialog
  ] = useState(false);

  const [
    editingSubcategory,
    setEditingSubcategory
  ] = useState<Subcategory | null>(null);

  const [
    subcategoryForm,
    setSubcategoryForm
  ] = useState<SubcategoryForm>(
    EMPTY_SUBCATEGORY_FORM
  );

  const [
    deleteSubcategoryDialog,
    setDeleteSubcategoryDialog
  ] = useState(false);

  const [
    subcategoryToDelete,
    setSubcategoryToDelete
  ] = useState<Subcategory | null>(null);

  // ====================================================
  // ERROR
  // ====================================================

  const [
    errorMessage,
    setErrorMessage
  ] = useState('');

  // ====================================================
  // FETCH CATEGORIES
  // ====================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<GetCategoriesData>(
    GET_CATEGORIES,
    {
      variables: {
        search: search.trim()
          ? search.trim()
          : undefined,

        status:
          statusFilter === 'ALL'
            ? undefined
            : statusFilter
      },

      fetchPolicy: 'network-only',

      notifyOnNetworkStatusChange:
        true
    }
  );

  // ====================================================
  // FETCH SUBCATEGORIES
  // ====================================================

  const {
    data: subcategoryData,
    loading: subcategoriesLoading,
    error: subcategoriesError,
    refetch: refetchSubcategories
  } = useQuery<GetSubcategoriesData>(
    GET_SUBCATEGORIES,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange:
        true
    }
  );

  // ====================================================
  // FETCH ACTIVE BUSINESS TYPES
  // ====================================================

  const {
    data: businessTypesData,
    loading: businessTypesLoading,
    error: businessTypesError,
    refetch: refetchBusinessTypes
  } = useQuery<GetBusinessTypesData>(
    GET_BUSINESS_TYPES,
    {
      variables: {
        status: 'ACTIVE'
      },

      fetchPolicy: 'network-only',

      notifyOnNetworkStatusChange:
        true
    }
  );

  // ====================================================
  // MUTATIONS
  // ====================================================

  const [
    createCategory,
    {
      loading: creatingCategory
    }
  ] = useMutation<CreateCategoryData>(
    CREATE_CATEGORY
  );

  const [
    updateCategory,
    {
      loading: updatingCategory
    }
  ] = useMutation<UpdateCategoryData>(
    UPDATE_CATEGORY
  );

  const [
    deleteCategory,
    {
      loading: deletingCategory
    }
  ] = useMutation<DeleteCategoryData>(
    DELETE_CATEGORY
  );

  const [
    createSubcategory,
    {
      loading: creatingSubcategory
    }
  ] = useMutation<CreateSubcategoryData>(
    CREATE_SUBCATEGORY
  );

  const [
    updateSubcategory,
    {
      loading: updatingSubcategory
    }
  ] = useMutation<UpdateSubcategoryData>(
    UPDATE_SUBCATEGORY
  );

  const [
    deleteSubcategory,
    {
      loading: deletingSubcategory
    }
  ] = useMutation<DeleteSubcategoryData>(
    DELETE_SUBCATEGORY
  );

  // ====================================================
  // SERVER DATA
  // ====================================================

  const categories: Category[] =
    data?.categories?.categories ?? [];

  const subcategories: Subcategory[] =
    subcategoryData
      ?.subcategories
      ?.subcategories ?? [];

  const businessTypes: BusinessType[] =
    businessTypesData
      ?.businessTypes
      ?.businessTypes ?? [];

  // ====================================================
  // ACTIVE BUSINESS TYPES
  // ====================================================

  const activeBusinessTypes =
    useMemo(() => {
      const unique = new Map<
        string,
        BusinessType
      >();

      businessTypes
        .filter(
          businessType =>
            businessType.status ===
              'ACTIVE' &&
            Boolean(
              businessType.name?.trim()
            )
        )
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              sensitivity: 'base'
            }
          )
        )
        .forEach(businessType => {
          const id =
            String(
              businessType.businessTypeId ??
                ''
            ).trim();

          if (id) {
            unique.set(id, businessType);
          }
        });

      return Array.from(
        unique.values()
      );
    }, [businessTypes]);

  // ====================================================
  // BUSINESS TYPE NAME
  // ====================================================

  const getBusinessTypeName = (
    businessTypeId: string
  ) => {
    const normalizedId =
      String(
        businessTypeId ?? ''
      ).trim();

    if (!normalizedId) {
      return 'Unknown';
    }

    const businessType =
      businessTypes.find(
        item =>
          String(
            item.businessTypeId
          ).trim() ===
          normalizedId
      );

    return (
      businessType?.name ||
      normalizedId
    );
  };

  // ====================================================
  // CATEGORY BUSINESS TYPES
  // ====================================================

  const getCategoryBusinessTypeIds =
    (
      category: Category
    ): string[] => {
      if (
        !Array.isArray(
          category.businessTypeIds
        )
      ) {
        return [];
      }

      return Array.from(
        new Set(
          category.businessTypeIds
            .map(id =>
              String(
                id ?? ''
              ).trim()
            )
            .filter(Boolean)
        )
      );
    };

  // ====================================================
  // SUBCATEGORY BUSINESS TYPE OPTIONS
  //
  // IMPORTANT:
  //
  // A subcategory may ONLY use business
  // types already configured on its parent
  // category.
  // ====================================================

  const availableSubcategoryBusinessTypes =
    useMemo(() => {
      const category =
        categories.find(
          item =>
            item.categoryId ===
            subcategoryForm.categoryId
        );

      if (!category) {
        return [];
      }

      const categoryBusinessTypeIds =
        new Set(
          getCategoryBusinessTypeIds(
            category
          )
        );

      return activeBusinessTypes.filter(
        businessType =>
          categoryBusinessTypeIds.has(
            String(
              businessType.businessTypeId
            ).trim()
          )
      );
    }, [
      categories,
      subcategoryForm.categoryId,
      activeBusinessTypes
    ]);

  // ====================================================
  // CATEGORY COUNTERS
  // ====================================================

  const totalCategories =
    data?.categories?.totalCount ??
    categories.length;

  const activeCategories =
    useMemo(
      () =>
        categories.filter(
          category =>
            category.status ===
            'ACTIVE'
        ).length,
      [categories]
    );

  const inactiveCategories =
    useMemo(
      () =>
        categories.filter(
          category =>
            category.status ===
            'INACTIVE'
        ).length,
      [categories]
    );

  const totalServices =
    useMemo(
      () =>
        categories.reduce(
          (
            total,
            category
          ) =>
            total +
            Number(
              category.servicesCount ??
                0
            ),
          0
        ),
      [categories]
    );

  // ====================================================
  // PAGINATION
  // ====================================================

  const paginatedCategories =
    useMemo(
      () =>
        categories.slice(
          page * rowsPerPage,
          page * rowsPerPage +
            rowsPerPage
        ),
      [
        categories,
        page,
        rowsPerPage
      ]
    );

  useEffect(() => {
    const maxPage =
      Math.max(
        0,
        Math.ceil(
          categories.length /
            rowsPerPage
        ) - 1
      );

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [
    categories.length,
    page,
    rowsPerPage
  ]);

  // ====================================================
  // ERROR HANDLING
  // ====================================================

  useEffect(() => {
    if (error) {
      setErrorMessage(
        error.message
      );
    }
  }, [error]);

  useEffect(() => {
    if (subcategoriesError) {
      setErrorMessage(
        subcategoriesError.message
      );
    }
  }, [subcategoriesError]);

  useEffect(() => {
    if (businessTypesError) {
      setErrorMessage(
        businessTypesError.message
      );
    }
  }, [businessTypesError]);

  // ====================================================
  // CREATE CATEGORY
  // ====================================================

  const handleOpenCreateCategory =
    () => {
      setEditingCategory(null);

      setCategoryForm({
        ...EMPTY_CATEGORY_FORM,
        businessTypeIds: []
      });

      setErrorMessage('');

      setOpenCategoryDialog(true);
    };

  // ====================================================
  // EDIT CATEGORY
  // ====================================================

  const handleOpenEditCategory =
    (
      category: Category
    ) => {
      const businessTypeIds =
        Array.isArray(
          category.businessTypeIds
        )
          ? Array.from(
              new Set(
                category.businessTypeIds
                  .map(id =>
                    String(
                      id ?? ''
                    ).trim()
                  )
                  .filter(Boolean)
              )
            )
          : [];

      setEditingCategory(
        category
      );

      setCategoryForm({
        name: category.name,
        description:
          category.description ??
          '',
        status: category.status,
        businessTypeIds
      });

      setErrorMessage('');

      setOpenCategoryDialog(true);
    };

  // ====================================================
  // CLOSE CATEGORY DIALOG
  // ====================================================

  const handleCloseCategoryDialog =
    () => {
      if (
        creatingCategory ||
        updatingCategory
      ) {
        return;
      }

      setOpenCategoryDialog(false);

      setEditingCategory(null);

      setCategoryForm({
        ...EMPTY_CATEGORY_FORM,
        businessTypeIds: []
      });

      setErrorMessage('');
    };

  // ====================================================
  // CATEGORY INPUT
  // ====================================================

  const handleCategoryInputChange =
    (
      field:
        | 'name'
        | 'description',
      value: string
    ) => {
      setCategoryForm(
        previous => ({
          ...previous,
          [field]: value
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // CATEGORY STATUS
  // ====================================================

  const handleCategoryStatusChange =
    (
      event: SelectChangeEvent
    ) => {
      setCategoryForm(
        previous => ({
          ...previous,
          status:
            event.target
              .value as CategoryStatus
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // CATEGORY BUSINESS TYPES
  // ====================================================

  const handleCategoryBusinessTypesChange =
    (
      event: SelectChangeEvent<
        string[]
      >
    ) => {
      const value =
        event.target.value;

      const ids = Array.isArray(
        value
      )
        ? value
        : typeof value ===
          'string'
        ? value
            .split(',')
            .map(item =>
              item.trim()
            )
            .filter(Boolean)
        : [];

      setCategoryForm(
        previous => ({
          ...previous,
          businessTypeIds:
            Array.from(
              new Set(ids)
            )
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SAVE CATEGORY
  // ====================================================

  const handleSaveCategory =
    async () => {
      const name =
        categoryForm.name.trim();

      const description =
        categoryForm.description.trim();

      const businessTypeIds =
        Array.from(
          new Set(
            categoryForm.businessTypeIds
              .map(id =>
                String(
                  id ?? ''
                ).trim()
              )
              .filter(Boolean)
          )
        );

      if (!name) {
        setErrorMessage(
          'Category name is required.'
        );

        return;
      }

      if (
        businessTypeIds.length ===
        0
      ) {
        setErrorMessage(
          'Please select at least one business type for this category.'
        );

        return;
      }

      try {
        setErrorMessage('');

        // ==============================================
        // UPDATE
        // ==============================================

        if (editingCategory) {
          const response =
            await updateCategory({
              variables: {
                input: {
                  categoryId:
                    editingCategory.categoryId,

                  name,

                  description:
                    description ||
                    null,

                  status:
                    categoryForm.status,

                  businessTypeIds
                }
              }
            });

          const result =
            response.data
              ?.updateCategory;

          if (!result?.success) {
            throw new Error(
              result?.message ||
                'Failed to update category.'
            );
          }
        }

        // ==============================================
        // CREATE
        // ==============================================

        else {
          const response =
            await createCategory({
              variables: {
                input: {
                  name,

                  description:
                    description ||
                    null,

                  status:
                    categoryForm.status,

                  businessTypeIds
                }
              }
            });

          const result =
            response.data
              ?.createCategory;

          if (!result?.success) {
            throw new Error(
              result?.message ||
                'Failed to create category.'
            );
          }
        }

        await refetch();

        setOpenCategoryDialog(
          false
        );

        setEditingCategory(null);

        setCategoryForm({
          ...EMPTY_CATEGORY_FORM,
          businessTypeIds: []
        });

        setErrorMessage('');
      } catch (err) {
        console.error(
          'Category save error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to save category.'
        );
      }
    };

  // ====================================================
  // DELETE CATEGORY
  // ====================================================

  const handleOpenDeleteCategory =
    (
      category: Category
    ) => {
      setCategoryToDelete(
        category
      );

      setErrorMessage('');

      setDeleteCategoryDialog(
        true
      );
    };

  const handleCloseDeleteCategory =
    () => {
      if (deletingCategory) {
        return;
      }

      setDeleteCategoryDialog(
        false
      );

      setCategoryToDelete(null);

      setErrorMessage('');
    };

  const handleDeleteCategory =
    async () => {
      if (!categoryToDelete) {
        return;
      }

      try {
        setErrorMessage('');

        const response =
          await deleteCategory({
            variables: {
              categoryId:
                categoryToDelete.categoryId
            }
          });

        const result =
          response.data
            ?.deleteCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to delete category.'
          );
        }

        await refetch();

        await refetchSubcategories();

        setDeleteCategoryDialog(
          false
        );

        setCategoryToDelete(null);

        setErrorMessage('');
      } catch (err) {
        console.error(
          'Category delete error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to delete category.'
        );
      }
    };

  // ====================================================
  // TOGGLE CATEGORY STATUS
  // ====================================================

  const handleToggleCategoryStatus =
    async (
      category: Category
    ) => {
      try {
        setErrorMessage('');

        const newStatus: CategoryStatus =
          category.status ===
          'ACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

        const response =
          await updateCategory({
            variables: {
              input: {
                categoryId:
                  category.categoryId,

                status: newStatus
              }
            }
          });

        const result =
          response.data
            ?.updateCategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to update category status.'
          );
        }

        await refetch();
      } catch (err) {
        console.error(
          'Category status error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to update category status.'
        );
      }
    };

  // ====================================================
  // CREATE SUBCATEGORY
  // ====================================================

  const handleOpenCreateSubcategory =
    (
      category?: Category
    ) => {
      if (!category) {
        setEditingSubcategory(null);

        setSubcategoryForm({
          ...EMPTY_SUBCATEGORY_FORM,
          businessTypeIds: []
        });
      } else {
        const categoryBusinessTypeIds =
          getCategoryBusinessTypeIds(
            category
          );

        setEditingSubcategory(null);

        setSubcategoryForm({
          ...EMPTY_SUBCATEGORY_FORM,
          categoryId:
            category.categoryId,
          businessTypeIds:
            categoryBusinessTypeIds
        });
      }

      setErrorMessage('');

      setOpenSubcategoryDialog(
        true
      );
    };

  // ====================================================
  // EDIT SUBCATEGORY
  // ====================================================

  const handleOpenEditSubcategory =
    (
      subcategory: Subcategory
    ) => {
      const parentCategory =
        categories.find(
          category =>
            category.categoryId ===
            subcategory.categoryId
        );

      const parentBusinessTypeIds =
        parentCategory
          ? getCategoryBusinessTypeIds(
              parentCategory
            )
          : [];

      const existingBusinessTypeIds =
        Array.isArray(
          subcategory.businessTypeIds
        )
          ? subcategory.businessTypeIds
              .map(id =>
                String(
                  id ?? ''
                ).trim()
              )
              .filter(Boolean)
          : [];

      /*
       * Only retain business types that
       * are still valid for the parent
       * category.
       */
      const validBusinessTypeIds =
        existingBusinessTypeIds.filter(
          id =>
            parentBusinessTypeIds.includes(
              id
            )
        );

      setEditingSubcategory(
        subcategory
      );

      setSubcategoryForm({
        categoryId:
          subcategory.categoryId,

        name: subcategory.name,

        description:
          subcategory.description ??
          '',

        status:
          subcategory.status,

        audiences:
          Array.isArray(
            subcategory.audiences
          )
            ? Array.from(
                new Set(
                  subcategory.audiences.filter(
                    audience =>
                      audience ===
                        'FEMALE' ||
                      audience ===
                        'MALE' ||
                      audience ===
                        'KIDS'
                  )
                )
              )
            : [],

        businessTypeIds:
          validBusinessTypeIds
      });

      setErrorMessage('');

      setOpenSubcategoryDialog(
        true
      );
    };

  // ====================================================
  // CLOSE SUBCATEGORY DIALOG
  // ====================================================

  const handleCloseSubcategoryDialog =
    () => {
      if (
        creatingSubcategory ||
        updatingSubcategory
      ) {
        return;
      }

      setOpenSubcategoryDialog(
        false
      );

      setEditingSubcategory(null);

      setSubcategoryForm({
        ...EMPTY_SUBCATEGORY_FORM,
        businessTypeIds: []
      });

      setErrorMessage('');
    };

  // ====================================================
  // SUBCATEGORY INPUT
  // ====================================================

  const handleSubcategoryInputChange =
    (
      field:
        | 'name'
        | 'description',
      value: string
    ) => {
      setSubcategoryForm(
        previous => ({
          ...previous,
          [field]: value
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SUBCATEGORY CATEGORY CHANGE
  // ====================================================

  const handleSubcategoryCategoryChange =
    (
      event: SelectChangeEvent
    ) => {
      const categoryId =
        event.target.value;

      const category =
        categories.find(
          item =>
            item.categoryId ===
            categoryId
        );

      const businessTypeIds =
        category
          ? getCategoryBusinessTypeIds(
              category
            )
          : [];

      setSubcategoryForm(
        previous => ({
          ...previous,

          categoryId,

          /*
           * Automatically synchronize
           * business types with the
           * selected parent category.
           */
          businessTypeIds
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SUBCATEGORY STATUS
  // ====================================================

  const handleSubcategoryStatusChange =
    (
      event: SelectChangeEvent
    ) => {
      setSubcategoryForm(
        previous => ({
          ...previous,
          status:
            event.target
              .value as SubcategoryStatus
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SUBCATEGORY AUDIENCE
  // ====================================================

  const handleSubcategoryAudiencesChange =
    (
      event: SelectChangeEvent<
        string[]
      >
    ) => {
      const value =
        event.target.value;

      const audiences =
        Array.isArray(value)
          ? value.filter(
              (
                item
              ): item is ServiceAudience =>
                item === 'FEMALE' ||
                item === 'MALE' ||
                item === 'KIDS'
            )
          : typeof value ===
            'string'
          ? value
              .split(',')
              .filter(
                (
                  item
                ): item is ServiceAudience =>
                  item === 'FEMALE' ||
                  item === 'MALE' ||
                  item === 'KIDS'
              )
          : [];

      setSubcategoryForm(
        previous => ({
          ...previous,
          audiences:
            Array.from(
              new Set(audiences)
            )
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SUBCATEGORY BUSINESS TYPES
  // ====================================================

  const handleSubcategoryBusinessTypesChange =
    (
      event: SelectChangeEvent<
        string[]
      >
    ) => {
      const value =
        event.target.value;

      const ids = Array.isArray(
        value
      )
        ? value
        : typeof value ===
          'string'
        ? value
            .split(',')
            .map(item =>
              item.trim()
            )
            .filter(Boolean)
        : [];

      const allowedIds =
        new Set(
          availableSubcategoryBusinessTypes.map(
            businessType =>
              String(
                businessType.businessTypeId
              ).trim()
          )
        );

      const validIds =
        ids.filter(id =>
          allowedIds.has(id)
        );

      setSubcategoryForm(
        previous => ({
          ...previous,
          businessTypeIds:
            Array.from(
              new Set(validIds)
            )
        })
      );

      setErrorMessage('');
    };

  // ====================================================
  // SAVE SUBCATEGORY
  // ====================================================

  const handleSaveSubcategory =
    async () => {
      const name =
        subcategoryForm.name.trim();

      const description =
        subcategoryForm.description.trim();

      const categoryId =
        subcategoryForm.categoryId.trim();

      const audiences =
        Array.from(
          new Set(
            subcategoryForm.audiences
              .filter(
                audience =>
                  audience ===
                    'FEMALE' ||
                  audience ===
                    'MALE' ||
                  audience ===
                    'KIDS'
              )
          )
        );

      const businessTypeIds =
        Array.from(
          new Set(
            subcategoryForm.businessTypeIds
              .map(id =>
                String(
                  id ?? ''
                ).trim()
              )
              .filter(Boolean)
          )
        );

      if (!categoryId) {
        setErrorMessage(
          'Please select a parent category.'
        );

        return;
      }

      if (!name) {
        setErrorMessage(
          'Subcategory name is required.'
        );

        return;
      }

      if (
        audiences.length ===
        0
      ) {
        setErrorMessage(
          'Please select at least one audience.'
        );

        return;
      }

      const parentCategory =
        categories.find(
          category =>
            category.categoryId ===
            categoryId
        );

      if (!parentCategory) {
        setErrorMessage(
          'The selected parent category could not be found.'
        );

        return;
      }

      const parentBusinessTypeIds =
        getCategoryBusinessTypeIds(
          parentCategory
        );

      const invalidBusinessType =
        businessTypeIds.some(
          id =>
            !parentBusinessTypeIds.includes(
              id
            )
        );

      if (invalidBusinessType) {
        setErrorMessage(
          'A subcategory can only use business types assigned to its parent category.'
        );

        return;
      }

      if (
        businessTypeIds.length ===
        0
      ) {
        setErrorMessage(
          'Please select at least one business type for this subcategory.'
        );

        return;
      }

      try {
        setErrorMessage('');

        // ==============================================
        // UPDATE
        // ==============================================

        if (editingSubcategory) {
          const response =
            await updateSubcategory({
              variables: {
                input: {
                  subcategoryId:
                    editingSubcategory.subcategoryId,

                  categoryId,

                  name,

                  description:
                    description ||
                    null,

                  status:
                    subcategoryForm.status,

                  audiences,

                  businessTypeIds
                }
              }
            });

          const result =
            response.data
              ?.updateSubcategory;

          if (!result?.success) {
            throw new Error(
              result?.message ||
                'Failed to update subcategory.'
            );
          }
        }

        // ==============================================
        // CREATE
        // ==============================================

        else {
          const response =
            await createSubcategory({
              variables: {
                input: {
                  categoryId,

                  name,

                  description:
                    description ||
                    null,

                  status:
                    subcategoryForm.status,

                  audiences,

                  businessTypeIds
                }
              }
            });

          const result =
            response.data
              ?.createSubcategory;

          if (!result?.success) {
            throw new Error(
              result?.message ||
                'Failed to create subcategory.'
            );
          }
        }

        await refetch();

        await refetchSubcategories();

        setOpenSubcategoryDialog(
          false
        );

        setEditingSubcategory(
          null
        );

        setSubcategoryForm({
          ...EMPTY_SUBCATEGORY_FORM,
          businessTypeIds: []
        });

        setErrorMessage('');
      } catch (err) {
        console.error(
          'Subcategory save error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to save subcategory.'
        );
      }
    };

  // ====================================================
  // DELETE SUBCATEGORY
  // ====================================================

  const handleOpenDeleteSubcategory =
    (
      subcategory: Subcategory
    ) => {
      setSubcategoryToDelete(
        subcategory
      );

      setErrorMessage('');

      setDeleteSubcategoryDialog(
        true
      );
    };

  const handleCloseDeleteSubcategory =
    () => {
      if (deletingSubcategory) {
        return;
      }

      setDeleteSubcategoryDialog(
        false
      );

      setSubcategoryToDelete(
        null
      );

      setErrorMessage('');
    };

  const handleDeleteSubcategory =
    async () => {
      if (
        !subcategoryToDelete
      ) {
        return;
      }

      try {
        setErrorMessage('');

        const response =
          await deleteSubcategory({
            variables: {
              subcategoryId:
                subcategoryToDelete.subcategoryId
            }
          });

        const result =
          response.data
            ?.deleteSubcategory;

        if (!result?.success) {
          throw new Error(
            result?.message ||
              'Failed to delete subcategory.'
          );
        }

        await refetch();

        await refetchSubcategories();

        setDeleteSubcategoryDialog(
          false
        );

        setSubcategoryToDelete(
          null
        );

        setErrorMessage('');
      } catch (err) {
        console.error(
          'Subcategory delete error:',
          err
        );

        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to delete subcategory.'
        );
      }
    };

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);

    setPage(0);
  };

  // ====================================================
  // STATUS FILTER
  // ====================================================

  const handleStatusFilterChange =
    (
      event: SelectChangeEvent
    ) => {
      setStatusFilter(
        event.target.value as StatusFilter
      );

      setPage(0);
    };

  // ====================================================
  // DATE FORMAT
  // ====================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return '—';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  // ====================================================
  // SUMMARY CARD
  // ====================================================

  const SummaryCard = ({
    title,
    value,
    subtitle
  }: {
    title: string;
    value: number;
    subtitle: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 0.5
        }}
      >
        {value.toLocaleString()}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {subtitle}
      </Typography>
    </Paper>
  );

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <Box>

      {/* ==================================================
          HEADER
      ================================================== */}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage service categories
            and subcategories available
            across Clavata.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
        >
          <Button
            variant="outlined"
            startIcon={
              <PlusOutlined />
            }
            onClick={() =>
              handleOpenCreateSubcategory()
            }
            sx={{
              borderRadius: 1.5,
              textTransform: 'none'
            }}
          >
            Add Subcategory
          </Button>

          <Button
            variant="contained"
            startIcon={
              <PlusOutlined />
            }
            onClick={
              handleOpenCreateCategory
            }
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              px: 2.5,
              py: 1
            }}
          >
            Add Category
          </Button>
        </Stack>
      </Box>

      {/* ==================================================
          ERROR
      ================================================== */}

      {errorMessage && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid',
            borderColor:
              'error.light',
            borderRadius: 2
          }}
        >
          <Typography
            variant="body2"
            color="error"
          >
            {errorMessage}
          </Typography>
        </Paper>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Total Categories"
            value={
              totalCategories
            }
            subtitle="All configured categories"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Active"
            value={
              activeCategories
            }
            subtitle="Currently available"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Inactive"
            value={
              inactiveCategories
            }
            subtitle="Currently disabled"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Services"
            value={totalServices}
            subtitle="Services across categories"
          />
        </Grid>
      </Grid>

      {/* ==================================================
          CATEGORY TABLE
      ================================================== */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >

        {/* FILTERS */}

        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
            justifyContent="space-between"
          >

            <TextField
              value={search}
              onChange={event =>
                handleSearchChange(
                  event.target.value
                )
              }
              placeholder="Search categories..."
              size="small"
              sx={{
                width: {
                  xs: '100%',
                  md: 350
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Select
              value={
                statusFilter
              }
              size="small"
              onChange={
                handleStatusFilterChange
              }
              sx={{
                minWidth: 150
              }}
            >
              <MenuItem value="ALL">
                All Status
              </MenuItem>

              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>
            </Select>
          </Stack>
        </Box>

        <Divider />

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Category
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Business Types
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Description
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Services
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Created
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Actions
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{
                      py: 8
                    }}
                  >
                    <Stack
                      spacing={2}
                      alignItems="center"
                    >
                      <CircularProgress
                        size={32}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Loading categories...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paginatedCategories.map(
                  category => {

                    const categoryBusinessTypeIds =
                      getCategoryBusinessTypeIds(
                        category
                      );

                    return (
                      <TableRow
                        key={
                          category.categoryId
                        }
                        hover
                      >

                        {/* CATEGORY */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 1.5,
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                backgroundColor:
                                  'primary.lighter',
                                color:
                                  'primary.main'
                              }}
                            >
                              <TagsOutlined
                                style={{
                                  fontSize: 19
                                }}
                              />
                            </Box>

                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600
                                }}
                              >
                                {
                                  category.name
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  category.categoryId
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* BUSINESS TYPES */}

                        <TableCell>
                          {categoryBusinessTypeIds.length >
                          0 ? (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              {categoryBusinessTypeIds.map(
                                businessTypeId => (
                                  <Chip
                                    key={`${category.categoryId}-${businessTypeId}`}
                                    label={getBusinessTypeName(
                                      businessTypeId
                                    )}
                                    size="small"
                                    variant="outlined"
                                  />
                                )
                              )}
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="error"
                            >
                              No business type
                            </Typography>
                          )}
                        </TableCell>

                        {/* DESCRIPTION */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 300
                            }}
                          >
                            {
                              category.description ||
                              '—'
                            }
                          </Typography>
                        </TableCell>

                        {/* SERVICES */}

                        <TableCell align="center">
                          <Chip
                            label={Number(
                              category.servicesCount ??
                                0
                            )}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <Tooltip
                            title={
                              category.status ===
                              'ACTIVE'
                                ? 'Click to deactivate'
                                : 'Click to activate'
                            }
                          >
                            <Chip
                              label={
                                category.status
                              }
                              size="small"
                              color={
                                category.status ===
                                'ACTIVE'
                                  ? 'success'
                                  : 'default'
                              }
                              variant="outlined"
                              onClick={() =>
                                handleToggleCategoryStatus(
                                  category
                                )
                              }
                              sx={{
                                cursor:
                                  'pointer',
                                fontWeight:
                                  600
                              }}
                            />
                          </Tooltip>
                        </TableCell>

                        {/* CREATED */}

                        <TableCell>
                          <Typography
                            variant="body2"
                          >
                            {formatDate(
                              category.createdAt
                            )}
                          </Typography>
                        </TableCell>

                        {/* ACTIONS */}

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Add Subcategory">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenCreateSubcategory(
                                    category
                                  )
                                }
                              >
                                <PlusOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenEditCategory(
                                    category
                                  )
                                }
                              >
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenDeleteCategory(
                                    category
                                  )
                                }
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>

                      </TableRow>
                    );
                  }
                )}

              {!loading &&
                paginatedCategories.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{
                        py: 8
                      }}
                    >
                      <TagsOutlined
                        style={{
                          fontSize: 40,
                          opacity: 0.4,
                          marginBottom: 12
                        }}
                      />

                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        No categories found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {search
                          ? 'Try changing your search.'
                          : 'Create your first category to get started.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={
            categories.length
          }
          page={page}
          rowsPerPage={
            rowsPerPage
          }
          onPageChange={(
            _,
            newPage
          ) =>
            setPage(newPage)
          }
          onRowsPerPageChange={event => {
            setRowsPerPage(
              parseInt(
                event.target.value,
                10
              )
            );

            setPage(0);
          }}
          rowsPerPageOptions={[
            5,
            10,
            25
          ]}
        />
      </Paper>

      {/* ==================================================
          SUBCATEGORY TABLE
      ================================================== */}

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700
            }}
          >
            Subcategories
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage services under each
            category.
          </Typography>
        </Box>

        <Divider />

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Subcategory
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Category
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Audiences
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Business Types
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Services
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Actions
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {subcategoriesLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{
                      py: 6
                    }}
                  >
                    <CircularProgress
                      size={28}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1
                      }}
                    >
                      Loading subcategories...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!subcategoriesLoading &&
                subcategories.map(
                  subcategory => {

                    const parentCategory =
                      categories.find(
                        category =>
                          category.categoryId ===
                          subcategory.categoryId
                      );

                    const subcategoryBusinessTypeIds =
                      Array.isArray(
                        subcategory.businessTypeIds
                      )
                        ? subcategory.businessTypeIds
                        : [];

                    return (
                      <TableRow
                        key={
                          subcategory.subcategoryId
                        }
                        hover
                      >

                        {/* SUBCATEGORY */}

                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600
                            }}
                          >
                            {
                              subcategory.name
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              subcategory.subcategoryId
                            }
                          </Typography>

                          {subcategory.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5
                              }}
                            >
                              {
                                subcategory.description
                              }
                            </Typography>
                          )}
                        </TableCell>

                        {/* CATEGORY */}

                        <TableCell>
                          <Typography
                            variant="body2"
                          >
                            {parentCategory?.name ||
                              subcategory.categoryId}
                          </Typography>
                        </TableCell>

                        {/* AUDIENCES */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {(
                              subcategory.audiences ??
                              []
                            ).map(
                              audience => (
                                <Chip
                                  key={`${subcategory.subcategoryId}-${audience}`}
                                  label={
                                    audience ===
                                    'FEMALE'
                                      ? 'Female'
                                      : audience ===
                                        'MALE'
                                      ? 'Male'
                                      : 'Kids'
                                  }
                                  size="small"
                                  variant="outlined"
                                />
                              )
                            )}
                          </Stack>
                        </TableCell>

                        {/* BUSINESS TYPES */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {subcategoryBusinessTypeIds.map(
                              businessTypeId => (
                                <Chip
                                  key={`${subcategory.subcategoryId}-${businessTypeId}`}
                                  label={getBusinessTypeName(
                                    businessTypeId
                                  )}
                                  size="small"
                                  variant="outlined"
                                />
                              )
                            )}

                            {subcategoryBusinessTypeIds.length ===
                              0 && (
                              <Typography
                                variant="body2"
                                color="error"
                              >
                                No business type
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {/* SERVICES */}

                        <TableCell align="center">
                          <Chip
                            label={Number(
                              subcategory.servicesCount ??
                                0
                            )}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <Chip
                            label={
                              subcategory.status
                            }
                            size="small"
                            color={
                              subcategory.status ===
                              'ACTIVE'
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>

                        {/* ACTIONS */}

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenEditSubcategory(
                                    subcategory
                                  )
                                }
                              >
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenDeleteSubcategory(
                                    subcategory
                                  )
                                }
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>

                      </TableRow>
                    );
                  }
                )}

              {!subcategoriesLoading &&
                subcategories.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{
                        py: 6
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        No subcategories found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ==================================================
          CATEGORY CREATE / EDIT DIALOG
      ================================================== */}

      <Dialog
        open={
          openCategoryDialog
        }
        onClose={
          handleCloseCategoryDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingCategory
            ? 'Edit Category'
            : 'Add Category'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >

            {errorMessage && (
              <Typography
                variant="body2"
                color="error"
              >
                {errorMessage}
              </Typography>
            )}

            {/* NAME */}

            <TextField
              label="Category Name"
              fullWidth
              required
              value={
                categoryForm.name
              }
              onChange={event =>
                handleCategoryInputChange(
                  'name',
                  event.target.value
                )
              }
              placeholder="e.g. Hair"
              disabled={
                creatingCategory ||
                updatingCategory
              }
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={
                categoryForm.description
              }
              onChange={event =>
                handleCategoryInputChange(
                  'description',
                  event.target.value
                )
              }
              placeholder="Describe what services belong to this category"
              disabled={
                creatingCategory ||
                updatingCategory
              }
            />

            {/* BUSINESS TYPES */}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display:
                    'block'
                }}
              >
                Business Types *
              </Typography>

              <Select
                multiple
                fullWidth
                displayEmpty
                value={
                  categoryForm.businessTypeIds
                }
                onChange={
                  handleCategoryBusinessTypesChange
                }
                disabled={
                  creatingCategory ||
                  updatingCategory ||
                  businessTypesLoading
                }
                renderValue={selected => {
                  const ids =
                    selected as string[];

                  if (
                    ids.length ===
                    0
                  ) {
                    return (
                      <Typography
                        color="text.secondary"
                      >
                        Select business types
                      </Typography>
                    );
                  }

                  return (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {ids.map(id => (
                        <Chip
                          key={id}
                          label={getBusinessTypeName(
                            id
                          )}
                          size="small"
                        />
                      ))}
                    </Stack>
                  );
                }}
              >
                {activeBusinessTypes.map(
                  businessType => (
                    <MenuItem
                      key={
                        businessType.businessTypeId
                      }
                      value={
                        businessType.businessTypeId
                      }
                    >
                      {businessType.name}
                    </MenuItem>
                  )
                )}
              </Select>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  display:
                    'block'
                }}
              >
                The category will be available
                only to salons registered under
                the selected business types.
              </Typography>
            </Box>

            {/* STATUS */}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display:
                    'block'
                }}
              >
                Status
              </Typography>

              <Select
                fullWidth
                value={
                  categoryForm.status
                }
                onChange={
                  handleCategoryStatusChange
                }
                disabled={
                  creatingCategory ||
                  updatingCategory
                }
              >
                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>
              </Select>
            </Box>

          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseCategoryDialog
            }
            color="inherit"
            disabled={
              creatingCategory ||
              updatingCategory
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveCategory
            }
            disabled={
              !categoryForm.name.trim() ||
              categoryForm.businessTypeIds
                .length === 0 ||
              creatingCategory ||
              updatingCategory
            }
            startIcon={
              creatingCategory ||
              updatingCategory ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {creatingCategory ||
            updatingCategory
              ? 'Saving...'
              : editingCategory
              ? 'Save Changes'
              : 'Create Category'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* ==================================================
          SUBCATEGORY CREATE / EDIT DIALOG
      ================================================== */}

      <Dialog
        open={
          openSubcategoryDialog
        }
        onClose={
          handleCloseSubcategoryDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingSubcategory
            ? 'Edit Subcategory'
            : 'Add Subcategory'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >

            {errorMessage && (
              <Typography
                variant="body2"
                color="error"
              >
                {errorMessage}
              </Typography>
            )}

            {/* CATEGORY */}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display:
                    'block'
                }}
              >
                Parent Category *
              </Typography>

              <Select
                fullWidth
                value={
                  subcategoryForm.categoryId
                }
                onChange={
                  handleSubcategoryCategoryChange
                }
                disabled={
                  creatingSubcategory ||
                  updatingSubcategory
                }
                displayEmpty
              >
                <MenuItem
                  value=""
                  disabled
                >
                  Select parent category
                </MenuItem>

                {categories
                  .filter(
                    category =>
                      category.status ===
                      'ACTIVE' ||
                      category.categoryId ===
                        subcategoryForm.categoryId
                  )
                  .sort((a, b) =>
                    a.name.localeCompare(
                      b.name,
                      undefined,
                      {
                        sensitivity:
                          'base'
                      }
                    )
                  )
                  .map(category => (
                    <MenuItem
                      key={
                        category.categoryId
                      }
                      value={
                        category.categoryId
                      }
                    >
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </Box>

            {/* NAME */}

            <TextField
              label="Subcategory Name"
              fullWidth
              required
              value={
                subcategoryForm.name
              }
              onChange={event =>
                handleSubcategoryInputChange(
                  'name',
                  event.target.value
                )
              }
              placeholder="e.g. Hair Cut"
              disabled={
                creatingSubcategory ||
                updatingSubcategory
              }
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={
                subcategoryForm.description
              }
              onChange={event =>
                handleSubcategoryInputChange(
                  'description',
                  event.target.value
                )
              }
              placeholder="Describe this service"
              disabled={
                creatingSubcategory ||
                updatingSubcategory
              }
            />

            {/* AUDIENCES */}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display:
                    'block'
                }}
              >
                Audiences *
              </Typography>

              <Select
                multiple
                fullWidth
                displayEmpty
                value={
                  subcategoryForm.audiences
                }
                onChange={
                  handleSubcategoryAudiencesChange
                }
                disabled={
                  creatingSubcategory ||
                  updatingSubcategory
                }
                renderValue={selected => {
                  const values =
                    selected as ServiceAudience[];

                  if (
                    values.length ===
                    0
                  ) {
                    return (
                      <Typography
                        color="text.secondary"
                      >
                        Select audiences
                      </Typography>
                    );
                  }

                  return (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {values.map(
                        audience => (
                          <Chip
                            key={audience}
                            label={
                              audience ===
                              'FEMALE'
                                ? 'Female'
                                : audience ===
                                  'MALE'
                                ? 'Male'
                                : 'Kids'
                            }
                            size="small"
                          />
                        )
                      )}
                    </Stack>
                  );
                }}
              >
                {AUDIENCE_OPTIONS.map(
                  option => (
                    <MenuItem
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </Box>

            {/* BUSINESS TYPES */}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display:
                    'block'
                }}
              >
                Business Types *
              </Typography>

              <Select
                multiple
                fullWidth
                displayEmpty
                value={
                  subcategoryForm.businessTypeIds
                }
                onChange={
                  handleSubcategoryBusinessTypesChange
                }
                disabled={
                  creatingSubcategory ||
                  updatingSubcategory ||
                  businessTypesLoading ||
                  !subcategoryForm.categoryId
                }
                renderValue={selected => {
                  const ids =
                    selected as string[];

                  if (
                    ids.length ===
                    0
                  ) {
                    return (
                      <Typography
                        color="text.secondary"
                      >
                        Select business types
                      </Typography>
                    );
                  }

                  return (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {ids.map(id => (
                        <Chip
                          key={id}
                          label={getBusinessTypeName(
                            id
                          )}
                          size="small"
                        />
                      ))}
                    </Stack>
                  );
                }}
              >
                {availableSubcategoryBusinessTypes.map(
                  businessType => (
                    <MenuItem
                      key={
                        businessType.businessTypeId
                      }
                      value={
                        businessType.businessTypeId
                      }
                    >
                      {businessType.name}
                    </MenuItem>
                  )
                )}
              </Select>

              {!subcategoryForm.categoryId ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    display:
                      'block'
                  }}
                >
                  Select a parent category
                  first.
                </Typography>
              ) : availableSubcategoryBusinessTypes.length ===
                0 ? (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    mt: 0.75,
                    display:
                      'block'
                  }}
                >
                  No business types are
                  configured for this parent
                  category.
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    display:
                      'block'
                  }}
                >
                  Only business types assigned
                  to the parent category can be
                  selected.
                </Typography>
              )}
            </Box>

            {/* STATUS */}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 0.75,
                  display:
                    'block'
                }}
              >
                Status
              </Typography>

              <Select
                fullWidth
                value={
                  subcategoryForm.status
                }
                onChange={
                  handleSubcategoryStatusChange
                }
                disabled={
                  creatingSubcategory ||
                  updatingSubcategory
                }
              >
                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>
              </Select>
            </Box>

          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseSubcategoryDialog
            }
            color="inherit"
            disabled={
              creatingSubcategory ||
              updatingSubcategory
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveSubcategory
            }
            disabled={
              !subcategoryForm.categoryId ||
              !subcategoryForm.name.trim() ||
              subcategoryForm.audiences
                .length === 0 ||
              subcategoryForm.businessTypeIds
                .length === 0 ||
              creatingSubcategory ||
              updatingSubcategory
            }
            startIcon={
              creatingSubcategory ||
              updatingSubcategory ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {creatingSubcategory ||
            updatingSubcategory
              ? 'Saving...'
              : editingSubcategory
              ? 'Save Changes'
              : 'Create Subcategory'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* ==================================================
          DELETE CATEGORY DIALOG
      ================================================== */}

      <Dialog
        open={
          deleteCategoryDialog
        }
        onClose={
          handleCloseDeleteCategory
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Category
        </DialogTitle>

        <DialogContent>

          {errorMessage && (
            <Typography
              variant="body2"
              color="error"
              sx={{
                mb: 2
              }}
            >
              {errorMessage}
            </Typography>
          )}

          <Typography
            variant="body2"
          >
            Are you sure you want to
            delete{' '}
            <strong>
              {
                categoryToDelete?.name
              }
            </strong>
            ?
          </Typography>

          {categoryToDelete &&
            categoryToDelete.servicesCount >
              0 && (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  mt: 2
                }}
              >
                This category currently
                contains{' '}
                {
                  categoryToDelete.servicesCount
                }{' '}
                services. It is recommended
                to deactivate this category
                instead of deleting it.
              </Typography>
            )}

        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseDeleteCategory
            }
            color="inherit"
            disabled={
              deletingCategory
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDeleteCategory
            }
            disabled={
              deletingCategory
            }
            startIcon={
              deletingCategory ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <DeleteOutlined />
              )
            }
          >
            {deletingCategory
              ? 'Deleting...'
              : 'Delete'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* ==================================================
          DELETE SUBCATEGORY DIALOG
      ================================================== */}

      <Dialog
        open={
          deleteSubcategoryDialog
        }
        onClose={
          handleCloseDeleteSubcategory
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Subcategory
        </DialogTitle>

        <DialogContent>

          {errorMessage && (
            <Typography
              variant="body2"
              color="error"
              sx={{
                mb: 2
              }}
            >
              {errorMessage}
            </Typography>
          )}

          <Typography
            variant="body2"
          >
            Are you sure you want to
            delete{' '}
            <strong>
              {
                subcategoryToDelete?.name
              }
            </strong>
            ?
          </Typography>

          {subcategoryToDelete &&
            subcategoryToDelete.servicesCount >
              0 && (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  mt: 2
                }}
              >
                This subcategory currently
                contains{' '}
                {
                  subcategoryToDelete.servicesCount
                }{' '}
                services. It is recommended
                to deactivate it instead of
                deleting it.
              </Typography>
            )}

        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >

          <Button
            onClick={
              handleCloseDeleteSubcategory
            }
            color="inherit"
            disabled={
              deletingSubcategory
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDeleteSubcategory
            }
            disabled={
              deletingSubcategory
            }
            startIcon={
              deletingSubcategory ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <DeleteOutlined />
              )
            }
          >
            {deletingSubcategory
              ? 'Deleting...'
              : 'Delete'}
          </Button>

        </DialogActions>
      </Dialog>

    </Box>
  );
}