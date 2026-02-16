export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            _prisma_migrations: {
                Row: {
                    applied_steps_count: number
                    checksum: string
                    finished_at: string | null
                    id: string
                    logs: string | null
                    migration_name: string
                    rolled_back_at: string | null
                    started_at: string
                }
                Insert: {
                    applied_steps_count?: number
                    checksum: string
                    finished_at?: string | null
                    id: string
                    logs?: string | null
                    migration_name: string
                    rolled_back_at?: string | null
                    started_at?: string
                }
                Update: {
                    applied_steps_count?: number
                    checksum?: string
                    finished_at?: string | null
                    id?: string
                    logs?: string | null
                    migration_name?: string
                    rolled_back_at?: string | null
                    started_at?: string
                }
                Relationships: []
            }
            Customer: {
                Row: {
                    address: string | null
                    createdAt: string
                    id: string
                    lineId: string | null
                    name: string
                    organizationId: string
                    phone: string | null
                    taxId: string | null
                    updatedAt: string
                }
                Insert: {
                    address?: string | null
                    createdAt?: string
                    id: string
                    lineId?: string | null
                    name: string
                    organizationId: string
                    phone?: string | null
                    taxId?: string | null
                    updatedAt: string
                }
                Update: {
                    address?: string | null
                    createdAt?: string
                    id?: string
                    lineId?: string | null
                    name?: string
                    organizationId?: string
                    phone?: string | null
                    taxId?: string | null
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "Customer_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            DesignFile: {
                Row: {
                    createdAt: string
                    fileName: string
                    fileType: string
                    fileUrl: string
                    id: string
                    orderId: string
                }
                Insert: {
                    createdAt?: string
                    fileName: string
                    fileType: string
                    fileUrl: string
                    id: string
                    orderId: string
                }
                Update: {
                    createdAt?: string
                    fileName?: string
                    fileType?: string
                    fileUrl?: string
                    id?: string
                    orderId?: string
                }
                Relationships: []
            }
            Invoice: {
                Row: {
                    amountPaid: number
                    createdAt: string
                    customerId: string | null
                    dueDate: string | null
                    grandTotal: number
                    id: string
                    invoiceNumber: string
                    orderId: string | null
                    organizationId: string
                    status: Database["public"]["Enums"]["DocumentStatus"]
                    totalAmount: number
                    updatedAt: string
                    vatAmount: number
                }
                Insert: {
                    amountPaid?: number
                    createdAt?: string
                    customerId?: string | null
                    dueDate?: string | null
                    grandTotal?: number
                    id: string
                    invoiceNumber: string
                    orderId?: string | null
                    organizationId: string
                    status?: Database["public"]["Enums"]["DocumentStatus"]
                    totalAmount?: number
                    updatedAt: string
                    vatAmount?: number
                }
                Update: {
                    amountPaid?: number
                    createdAt?: string
                    customerId?: string | null
                    dueDate?: string | null
                    grandTotal?: number
                    id?: string
                    invoiceNumber?: string
                    orderId?: string | null
                    organizationId?: string
                    status?: Database["public"]["Enums"]["DocumentStatus"]
                    totalAmount?: number
                    updatedAt?: string
                    vatAmount?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "Invoice_customerId_fkey"
                        columns: ["customerId"]
                        isOneToOne: false
                        referencedRelation: "Customer"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Invoice_orderId_fkey"
                        columns: ["orderId"]
                        isOneToOne: false
                        referencedRelation: "Order"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Invoice_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Material: {
                Row: {
                    costPrice: number
                    createdAt: string
                    id: string
                    inStock: number
                    minStock: number | null
                    name: string
                    organizationId: string
                    sellingPrice: number
                    type: Database["public"]["Enums"]["MaterialType"]
                    unit: string
                    updatedAt: string
                    wasteFactor: number
                }
                Insert: {
                    costPrice: number
                    createdAt?: string
                    id: string
                    inStock?: number
                    minStock?: number | null
                    name: string
                    organizationId: string
                    sellingPrice: number
                    type?: Database["public"]["Enums"]["MaterialType"]
                    unit: string
                    updatedAt: string
                    wasteFactor?: number
                }
                Update: {
                    costPrice?: number
                    createdAt?: string
                    id?: string
                    inStock?: number
                    minStock?: number | null
                    name?: string
                    organizationId?: string
                    sellingPrice?: number
                    type?: Database["public"]["Enums"]["MaterialType"]
                    unit?: string
                    updatedAt?: string
                    wasteFactor?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "Material_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Order: {
                Row: {
                    createdAt: string
                    customerId: string | null
                    deadline: string | null
                    grandTotal: number
                    id: string
                    notes: string | null
                    orderNumber: string
                    organizationId: string
                    priority: string | null
                    status: string
                    totalAmount: number
                    updatedAt: string
                    vatAmount: number
                }
                Insert: {
                    createdAt?: string
                    customerId?: string | null
                    deadline?: string | null
                    grandTotal?: number
                    id: string
                    notes?: string | null
                    orderNumber: string
                    organizationId: string
                    priority?: string | null
                    status?: string
                    totalAmount?: number
                    updatedAt: string
                    vatAmount?: number
                }
                Update: {
                    createdAt?: string
                    customerId?: string | null
                    deadline?: string | null
                    grandTotal?: number
                    id?: string
                    notes?: string | null
                    orderNumber?: string
                    organizationId?: string
                    priority?: string | null
                    status?: string
                    totalAmount?: number
                    updatedAt?: string
                    vatAmount?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "Order_customerId_fkey"
                        columns: ["customerId"]
                        isOneToOne: false
                        referencedRelation: "Customer"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Order_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            OrderItem: {
                Row: {
                    details: string | null
                    height: number | null
                    id: string
                    name: string
                    orderId: string
                    quantity: number
                    totalPrice: number
                    unitPrice: number
                    width: number | null
                }
                Insert: {
                    details?: string | null
                    height?: number | null
                    id: string
                    name: string
                    orderId: string
                    quantity?: number
                    totalPrice: number
                    unitPrice: number
                    width?: number | null
                }
                Update: {
                    details?: string | null
                    height?: number | null
                    id?: string
                    name?: string
                    orderId?: string
                    quantity?: number
                    totalPrice?: number
                    unitPrice?: number
                    width?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "OrderItem_orderId_fkey"
                        columns: ["orderId"]
                        isOneToOne: false
                        referencedRelation: "Order"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Organization: {
                Row: {
                    code: string
                    createdAt: string
                    id: string
                    name: string
                    updatedAt: string
                }
                Insert: {
                    code: string
                    createdAt?: string
                    id: string
                    name: string
                    updatedAt: string
                }
                Update: {
                    code?: string
                    createdAt?: string
                    id?: string
                    name?: string
                    updatedAt?: string
                }
                Relationships: []
            }
            Payment: {
                Row: {
                    amount: number
                    createdAt: string
                    id: string
                    invoiceId: string
                    organizationId: string
                    paymentAccountId: string | null
                    paymentDate: string
                    paymentMethod: string
                    reference: string | null
                }
                Insert: {
                    amount: number
                    createdAt?: string
                    id: string
                    invoiceId: string
                    organizationId: string
                    paymentAccountId?: string | null
                    paymentDate?: string
                    paymentMethod: string
                    reference?: string | null
                }
                Update: {
                    amount?: number
                    createdAt?: string
                    id?: string
                    invoiceId?: string
                    organizationId?: string
                    paymentAccountId?: string | null
                    paymentDate?: string
                    paymentMethod?: string
                    reference?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "Payment_invoiceId_fkey"
                        columns: ["invoiceId"]
                        isOneToOne: false
                        referencedRelation: "Invoice"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Payment_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Payment_paymentAccountId_fkey"
                        columns: ["paymentAccountId"]
                        isOneToOne: false
                        referencedRelation: "PaymentAccount"
                        referencedColumns: ["id"]
                    },
                ]
            }
            PaymentAccount: {
                Row: {
                    accountName: string | null
                    accountNumber: string | null
                    bankName: string | null
                    createdAt: string
                    id: string
                    isActive: boolean
                    isDefault: boolean
                    name: string
                    organizationId: string
                    type: string
                    updatedAt: string
                }
                Insert: {
                    accountName?: string | null
                    accountNumber?: string | null
                    bankName?: string | null
                    createdAt?: string
                    id?: string
                    isActive?: boolean
                    isDefault?: boolean
                    name: string
                    organizationId: string
                    type?: string
                    updatedAt?: string
                }
                Update: {
                    accountName?: string | null
                    accountNumber?: string | null
                    bankName?: string | null
                    createdAt?: string
                    id?: string
                    isActive?: boolean
                    isDefault?: boolean
                    name?: string
                    organizationId?: string
                    type?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "PaymentAccount_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            PricingTier: {
                Row: {
                    createdAt: string
                    discountPercent: number
                    id: string
                    materialId: string
                    minQuantity: number
                    updatedAt: string
                }
                Insert: {
                    createdAt?: string
                    discountPercent: number
                    id: string
                    materialId: string
                    minQuantity: number
                    updatedAt: string
                }
                Update: {
                    createdAt?: string
                    discountPercent?: number
                    id?: string
                    materialId?: string
                    minQuantity?: number
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "PricingTier_materialId_fkey"
                        columns: ["materialId"]
                        isOneToOne: false
                        referencedRelation: "Material"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Product: {
                Row: {
                    active: boolean
                    basePrice: number
                    createdAt: string
                    description: string | null
                    id: string
                    imageUrl: string | null
                    name: string
                    organizationId: string
                    updatedAt: string
                }
                Insert: {
                    active?: boolean
                    basePrice?: number
                    createdAt?: string
                    description?: string | null
                    id: string
                    imageUrl?: string | null
                    name: string
                    organizationId: string
                    updatedAt: string
                }
                Update: {
                    active?: boolean
                    basePrice?: number
                    createdAt?: string
                    description?: string | null
                    id?: string
                    imageUrl?: string | null
                    name?: string
                    organizationId?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "Product_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Quotation: {
                Row: {
                    createdAt: string
                    customerId: string | null
                    expiresAt: string | null
                    grandTotal: number
                    id: string
                    organizationId: string
                    quotationNumber: string
                    status: Database["public"]["Enums"]["DocumentStatus"]
                    totalAmount: number
                    updatedAt: string
                    vatAmount: number
                }
                Insert: {
                    createdAt?: string
                    customerId?: string | null
                    expiresAt?: string | null
                    grandTotal?: number
                    id: string
                    organizationId: string
                    quotationNumber: string
                    status?: Database["public"]["Enums"]["DocumentStatus"]
                    totalAmount?: number
                    updatedAt: string
                    vatAmount?: number
                }
                Update: {
                    createdAt?: string
                    customerId?: string | null
                    expiresAt?: string | null
                    grandTotal?: number
                    id?: string
                    organizationId?: string
                    quotationNumber?: string
                    status?: Database["public"]["Enums"]["DocumentStatus"]
                    totalAmount?: number
                    updatedAt?: string
                    vatAmount?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "Quotation_customerId_fkey"
                        columns: ["customerId"]
                        isOneToOne: false
                        referencedRelation: "Customer"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Quotation_organizationId_fkey"
                        columns: ["organizationId"]
                        isOneToOne: false
                        referencedRelation: "Organization"
                        referencedColumns: ["id"]
                    },
                ]
            }
            QuotationItem: {
                Row: {
                    details: string | null
                    height: number | null
                    id: string
                    name: string
                    quantity: number
                    quotationId: string
                    totalPrice: number
                    unitPrice: number
                    width: number | null
                }
                Insert: {
                    details?: string | null
                    height?: number | null
                    id: string
                    name: string
                    quantity?: number
                    quotationId: string
                    totalPrice: number
                    unitPrice: number
                    width?: number | null
                }
                Update: {
                    details?: string | null
                    height?: number | null
                    id?: string
                    name?: string
                    quantity?: number
                    quotationId?: string
                    totalPrice?: number
                    unitPrice?: number
                    width?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "QuotationItem_quotationId_fkey"
                        columns: ["quotationId"]
                        isOneToOne: false
                        referencedRelation: "Quotation"
                        referencedColumns: ["id"]
                    },
                ]
            }
            StockTransaction: {
                Row: {
                    createdAt: string
                    id: string
                    materialId: string
                    notes: string | null
                    quantity: number
                    reference: string | null
                    type: Database["public"]["Enums"]["TransactionType"]
                }
                Insert: {
                    createdAt?: string
                    id: string
                    materialId: string
                    notes?: string | null
                    quantity: number
                    reference?: string | null
                    type: Database["public"]["Enums"]["TransactionType"]
                }
                Update: {
                    createdAt?: string
                    id?: string
                    materialId?: string
                    notes?: string | null
                    quantity?: number
                    reference?: string | null
                    type: Database["public"]["Enums"]["TransactionType"]
                }
                Relationships: [
                    {
                        foreignKeyName: "StockTransaction_materialId_fkey"
                        columns: ["materialId"]
                        isOneToOne: false
                        referencedRelation: "Material"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            DocumentStatus: "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "VOID"
            MaterialType: "VINYL" | "SUBSTRATE" | "LAMINATE" | "INK" | "OTHER"
            TransactionType: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"
            UnitType: "SQM" | "LINEAR_METER" | "PIECE"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            DocumentStatus: ["DRAFT", "SENT", "PARTIAL", "PAID", "VOID"],
            MaterialType: ["VINYL", "SUBSTRATE", "LAMINATE", "INK", "OTHER"],
            TransactionType: ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"],
            UnitType: ["SQM", "LINEAR_METER", "PIECE"],
        },
    },
} as const
