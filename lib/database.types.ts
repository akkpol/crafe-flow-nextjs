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
      ApprovalWorkflow: {
        Row: {
          approvedat: string | null
          approvedby: string | null
          createdat: string | null
          entityid: string
          entitytype: string
          id: string
          reason: string | null
          requestedby: string | null
          status: string | null
        }
        Insert: {
          approvedat?: string | null
          approvedby?: string | null
          createdat?: string | null
          entityid: string
          entitytype: string
          id?: string
          reason?: string | null
          requestedby?: string | null
          status?: string | null
        }
        Update: {
          approvedat?: string | null
          approvedby?: string | null
          createdat?: string | null
          entityid?: string
          entitytype?: string
          id?: string
          reason?: string | null
          requestedby?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ApprovalWorkflow_approvedby_fkey"
            columns: ["approvedby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ApprovalWorkflow_requestedby_fkey"
            columns: ["requestedby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Attachment: {
        Row: {
          attachableid: string
          attachabletype: string
          category: string | null
          createdat: string | null
          description: string | null
          filename: string
          filesize: number | null
          filetype: string
          fileurl: string
          id: string
          ispublic: boolean | null
          organizationid: string
          replacesfileid: string | null
          tags: string[] | null
          thumbnailurl: string | null
          title: string | null
          uploadedby: string | null
          version: number | null
        }
        Insert: {
          attachableid: string
          attachabletype: string
          category?: string | null
          createdat?: string | null
          description?: string | null
          filename: string
          filesize?: number | null
          filetype: string
          fileurl: string
          id?: string
          ispublic?: boolean | null
          organizationid: string
          replacesfileid?: string | null
          tags?: string[] | null
          thumbnailurl?: string | null
          title?: string | null
          uploadedby?: string | null
          version?: number | null
        }
        Update: {
          attachableid?: string
          attachabletype?: string
          category?: string | null
          createdat?: string | null
          description?: string | null
          filename?: string
          filesize?: number | null
          filetype?: string
          fileurl?: string
          id?: string
          ispublic?: boolean | null
          organizationid?: string
          replacesfileid?: string | null
          tags?: string[] | null
          thumbnailurl?: string | null
          title?: string | null
          uploadedby?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Attachment_organizationid_fkey"
            columns: ["organizationid"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Attachment_replacesfileid_fkey"
            columns: ["replacesfileid"]
            isOneToOne: false
            referencedRelation: "Attachment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Attachment_uploadedby_fkey"
            columns: ["uploadedby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          is_spam: boolean
          post_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_spam?: boolean
          post_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_spam?: boolean
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "blog_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "blog_users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      Customer: {
        Row: {
          address: string | null
          branch: string | null
          companyname: string | null
          createdAt: string
          creditlimit: number | null
          email: string | null
          id: string
          isactive: boolean | null
          lineId: string | null
          name: string
          organizationId: string
          paymentterms: number | null
          phone: string | null
          taxId: string | null
          updatedAt: string
        }
        Insert: {
          address?: string | null
          branch?: string | null
          companyname?: string | null
          createdAt?: string
          creditlimit?: number | null
          email?: string | null
          id: string
          isactive?: boolean | null
          lineId?: string | null
          name: string
          organizationId: string
          paymentterms?: number | null
          phone?: string | null
          taxId?: string | null
          updatedAt: string
        }
        Update: {
          address?: string | null
          branch?: string | null
          companyname?: string | null
          createdAt?: string
          creditlimit?: number | null
          email?: string | null
          id?: string
          isactive?: boolean | null
          lineId?: string | null
          name?: string
          organizationId?: string
          paymentterms?: number | null
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
      CustomerLocation: {
        Row: {
          accessnotes: string | null
          addressline1: string
          addressline2: string | null
          contactonsite: string | null
          createdat: string | null
          customerid: string
          district: string | null
          googlemapsurl: string | null
          googleplaceid: string | null
          id: string
          isdefault: boolean | null
          label: string | null
          latitude: number | null
          locationtype: string | null
          longitude: number | null
          parkinginfo: string | null
          postalcode: string | null
          province: string | null
          sitephotourls: string[] | null
          subdistrict: string | null
          updatedat: string | null
        }
        Insert: {
          accessnotes?: string | null
          addressline1: string
          addressline2?: string | null
          contactonsite?: string | null
          createdat?: string | null
          customerid: string
          district?: string | null
          googlemapsurl?: string | null
          googleplaceid?: string | null
          id?: string
          isdefault?: boolean | null
          label?: string | null
          latitude?: number | null
          locationtype?: string | null
          longitude?: number | null
          parkinginfo?: string | null
          postalcode?: string | null
          province?: string | null
          sitephotourls?: string[] | null
          subdistrict?: string | null
          updatedat?: string | null
        }
        Update: {
          accessnotes?: string | null
          addressline1?: string
          addressline2?: string | null
          contactonsite?: string | null
          createdat?: string | null
          customerid?: string
          district?: string | null
          googlemapsurl?: string | null
          googleplaceid?: string | null
          id?: string
          isdefault?: boolean | null
          label?: string | null
          latitude?: number | null
          locationtype?: string | null
          longitude?: number | null
          parkinginfo?: string | null
          postalcode?: string | null
          province?: string | null
          sitephotourls?: string[] | null
          subdistrict?: string | null
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CustomerLocation_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          },
        ]
      }
      DesignFile: {
        Row: {
          createdAt: string
          fileName: string
          filesize: number | null
          fileType: string
          fileUrl: string
          id: string
          isactive: boolean | null
          notes: string | null
          orderId: string
          thumbnailurl: string | null
          uploadedby: string | null
          version: number | null
        }
        Insert: {
          createdAt?: string
          fileName: string
          filesize?: number | null
          fileType: string
          fileUrl: string
          id: string
          isactive?: boolean | null
          notes?: string | null
          orderId: string
          thumbnailurl?: string | null
          uploadedby?: string | null
          version?: number | null
        }
        Update: {
          createdAt?: string
          fileName?: string
          filesize?: number | null
          fileType?: string
          fileUrl?: string
          id?: string
          isactive?: boolean | null
          notes?: string | null
          orderId?: string
          thumbnailurl?: string | null
          uploadedby?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "DesignFile_uploadedby_fkey"
            columns: ["uploadedby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          isTaxInvoice: boolean
          orderId: string | null
          organizationId: string
          status: Database["public"]["Enums"]["DocumentStatus"]
          taxInvoiceDate: string | null
          taxInvoiceNumber: string | null
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
          isTaxInvoice?: boolean
          orderId?: string | null
          organizationId: string
          status?: Database["public"]["Enums"]["DocumentStatus"]
          taxInvoiceDate?: string | null
          taxInvoiceNumber?: string | null
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
          isTaxInvoice?: boolean
          orderId?: string | null
          organizationId?: string
          status?: Database["public"]["Enums"]["DocumentStatus"]
          taxInvoiceDate?: string | null
          taxInvoiceNumber?: string | null
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
      InvoiceItem: {
        Row: {
          description: string | null
          details: string | null
          discount: number | null
          height: number | null
          id: string
          invoiceId: string
          name: string
          quantity: number | null
          totalPrice: number | null
          unitPrice: number | null
          width: number | null
        }
        Insert: {
          description?: string | null
          details?: string | null
          discount?: number | null
          height?: number | null
          id?: string
          invoiceId: string
          name: string
          quantity?: number | null
          totalPrice?: number | null
          unitPrice?: number | null
          width?: number | null
        }
        Update: {
          description?: string | null
          details?: string | null
          discount?: number | null
          height?: number | null
          id?: string
          invoiceId?: string
          name?: string
          quantity?: number | null
          totalPrice?: number | null
          unitPrice?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "InvoiceItem_invoiceId_fkey"
            columns: ["invoiceId"]
            isOneToOne: false
            referencedRelation: "Invoice"
            referencedColumns: ["id"]
          },
        ]
      }
      line_users: {
        Row: {
          created_at: string | null
          display_name: string
          is_friend: boolean | null
          language: string | null
          last_interaction: string | null
          line_user_id: string
          picture_url: string | null
          status_message: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          is_friend?: boolean | null
          language?: string | null
          last_interaction?: string | null
          line_user_id: string
          picture_url?: string | null
          status_message?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          is_friend?: boolean | null
          language?: string | null
          last_interaction?: string | null
          line_user_id?: string
          picture_url?: string | null
          status_message?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      Material: {
        Row: {
          category: string | null
          costPrice: number
          createdAt: string
          description: string | null
          id: string
          imageurl: string | null
          inStock: number
          maxstock: number | null
          minStock: number | null
          name: string
          organizationId: string
          sellingPrice: number
          sku: string | null
          suppliername: string | null
          type: Database["public"]["Enums"]["MaterialType"]
          unit: string
          updatedAt: string
          wasteFactor: number
        }
        Insert: {
          category?: string | null
          costPrice: number
          createdAt?: string
          description?: string | null
          id: string
          imageurl?: string | null
          inStock?: number
          maxstock?: number | null
          minStock?: number | null
          name: string
          organizationId: string
          sellingPrice: number
          sku?: string | null
          suppliername?: string | null
          type?: Database["public"]["Enums"]["MaterialType"]
          unit: string
          updatedAt: string
          wasteFactor?: number
        }
        Update: {
          category?: string | null
          costPrice?: number
          createdAt?: string
          description?: string | null
          id?: string
          imageurl?: string | null
          inStock?: number
          maxstock?: number | null
          minStock?: number | null
          name?: string
          organizationId?: string
          sellingPrice?: number
          sku?: string | null
          suppliername?: string | null
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
      Notification: {
        Row: {
          actionurl: string | null
          createdat: string | null
          id: string
          isread: boolean | null
          message: string
          organizationid: string | null
          title: string
          type: string
          userid: string | null
        }
        Insert: {
          actionurl?: string | null
          createdat?: string | null
          id?: string
          isread?: boolean | null
          message: string
          organizationid?: string | null
          title: string
          type: string
          userid?: string | null
        }
        Update: {
          actionurl?: string | null
          createdat?: string | null
          id?: string
          isread?: boolean | null
          message?: string
          organizationid?: string | null
          title?: string
          type?: string
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Notification_organizationid_fkey"
            columns: ["organizationid"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notification_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Order: {
        Row: {
          assigneeId: string | null
          completedat: string | null
          createdAt: string
          customerId: string | null
          deadline: string | null
          grandTotal: number
          id: string
          installationdate: string | null
          notes: string | null
          orderNumber: string
          organizationId: string
          priority: string | null
          progresspercent: number | null
          quotationid: string | null
          status: string
          totalAmount: number
          updatedAt: string
          vatAmount: number
        }
        Insert: {
          assigneeId?: string | null
          completedat?: string | null
          createdAt?: string
          customerId?: string | null
          deadline?: string | null
          grandTotal?: number
          id: string
          installationdate?: string | null
          notes?: string | null
          orderNumber: string
          organizationId: string
          priority?: string | null
          progresspercent?: number | null
          quotationid?: string | null
          status?: string
          totalAmount?: number
          updatedAt: string
          vatAmount?: number
        }
        Update: {
          assigneeId?: string | null
          completedat?: string | null
          createdAt?: string
          customerId?: string | null
          deadline?: string | null
          grandTotal?: number
          id?: string
          installationdate?: string | null
          notes?: string | null
          orderNumber?: string
          organizationId?: string
          priority?: string | null
          progresspercent?: number | null
          quotationid?: string | null
          status?: string
          totalAmount?: number
          updatedAt?: string
          vatAmount?: number
        }
        Relationships: [
          {
            foreignKeyName: "Order_assigneeId_fkey"
            columns: ["assigneeId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "Order_quotationid_fkey"
            columns: ["quotationid"]
            isOneToOne: false
            referencedRelation: "Quotation"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderHistory: {
        Row: {
          action: string
          actorId: string | null
          createdAt: string | null
          details: string | null
          id: string
          newStatus: string | null
          oldStatus: string | null
          orderId: string
        }
        Insert: {
          action: string
          actorId?: string | null
          createdAt?: string | null
          details?: string | null
          id?: string
          newStatus?: string | null
          oldStatus?: string | null
          orderId: string
        }
        Update: {
          action?: string
          actorId?: string | null
          createdAt?: string | null
          details?: string | null
          id?: string
          newStatus?: string | null
          oldStatus?: string | null
          orderId?: string
        }
        Relationships: [
          {
            foreignKeyName: "OrderHistory_actorId_fkey"
            columns: ["actorId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderHistory_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
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
      OrderStatusConfig: {
        Row: {
          color: string | null
          createdat: string | null
          icon: string | null
          id: string
          isactive: boolean | null
          isdefault: boolean | null
          kanbancolumn: boolean | null
          labelenglish: string | null
          labelthai: string
          organizationid: string
          sortorder: number | null
          statuskey: string
          updatedat: string | null
        }
        Insert: {
          color?: string | null
          createdat?: string | null
          icon?: string | null
          id?: string
          isactive?: boolean | null
          isdefault?: boolean | null
          kanbancolumn?: boolean | null
          labelenglish?: string | null
          labelthai: string
          organizationid: string
          sortorder?: number | null
          statuskey: string
          updatedat?: string | null
        }
        Update: {
          color?: string | null
          createdat?: string | null
          icon?: string | null
          id?: string
          isactive?: boolean | null
          isdefault?: boolean | null
          kanbancolumn?: boolean | null
          labelenglish?: string | null
          labelthai?: string
          organizationid?: string
          sortorder?: number | null
          statuskey?: string
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "OrderStatusConfig_organizationid_fkey"
            columns: ["organizationid"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      Organization: {
        Row: {
          address: string | null
          code: string
          createdAt: string
          email: string | null
          id: string
          logoUrl: string | null
          name: string
          phone: string | null
          signatureUrl: string | null
          taxId: string | null
          updatedAt: string
          website: string | null
        }
        Insert: {
          address?: string | null
          code: string
          createdAt?: string
          email?: string | null
          id: string
          logoUrl?: string | null
          name: string
          phone?: string | null
          signatureUrl?: string | null
          taxId?: string | null
          updatedAt: string
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          createdAt?: string
          email?: string | null
          id?: string
          logoUrl?: string | null
          name?: string
          phone?: string | null
          signatureUrl?: string | null
          taxId?: string | null
          updatedAt?: string
          website?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      Quotation: {
        Row: {
          approvalstatus: string | null
          approvedat: string | null
          approvedby: string | null
          createdAt: string
          createdby: string | null
          customerId: string | null
          discount: number | null
          expiresAt: string | null
          grandTotal: number
          id: string
          notes: string | null
          organizationId: string
          paymenttermstext: string | null
          quotationNumber: string
          rejectionreason: string | null
          status: Database["public"]["Enums"]["DocumentStatus"]
          totalAmount: number
          updatedAt: string
          vatAmount: number
        }
        Insert: {
          approvalstatus?: string | null
          approvedat?: string | null
          approvedby?: string | null
          createdAt?: string
          createdby?: string | null
          customerId?: string | null
          discount?: number | null
          expiresAt?: string | null
          grandTotal?: number
          id: string
          notes?: string | null
          organizationId: string
          paymenttermstext?: string | null
          quotationNumber: string
          rejectionreason?: string | null
          status?: Database["public"]["Enums"]["DocumentStatus"]
          totalAmount?: number
          updatedAt: string
          vatAmount?: number
        }
        Update: {
          approvalstatus?: string | null
          approvedat?: string | null
          approvedby?: string | null
          createdAt?: string
          createdby?: string | null
          customerId?: string | null
          discount?: number | null
          expiresAt?: string | null
          grandTotal?: number
          id?: string
          notes?: string | null
          organizationId?: string
          paymenttermstext?: string | null
          quotationNumber?: string
          rejectionreason?: string | null
          status?: Database["public"]["Enums"]["DocumentStatus"]
          totalAmount?: number
          updatedAt?: string
          vatAmount?: number
        }
        Relationships: [
          {
            foreignKeyName: "Quotation_approvedby_fkey"
            columns: ["approvedby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Quotation_createdby_fkey"
            columns: ["createdby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          description: string | null
          details: string | null
          discount: number | null
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
          description?: string | null
          details?: string | null
          discount?: number | null
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
          description?: string | null
          details?: string | null
          discount?: number | null
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
      Receipt: {
        Row: {
          createdAt: string | null
          customerId: string
          id: string
          invoiceId: string
          notes: string | null
          organizationid: string | null
          paymentDate: string | null
          paymentid: string | null
          paymentMethod: string | null
          receiptNumber: string
          totalAmount: number | null
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          customerId: string
          id?: string
          invoiceId: string
          notes?: string | null
          organizationid?: string | null
          paymentDate?: string | null
          paymentid?: string | null
          paymentMethod?: string | null
          receiptNumber: string
          totalAmount?: number | null
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          customerId?: string
          id?: string
          invoiceId?: string
          notes?: string | null
          organizationid?: string | null
          paymentDate?: string | null
          paymentid?: string | null
          paymentMethod?: string | null
          receiptNumber?: string
          totalAmount?: number | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Receipt_customerId_fkey"
            columns: ["customerId"]
            isOneToOne: false
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Receipt_invoiceId_fkey"
            columns: ["invoiceId"]
            isOneToOne: false
            referencedRelation: "Invoice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Receipt_organizationid_fkey"
            columns: ["organizationid"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Receipt_paymentid_fkey"
            columns: ["paymentid"]
            isOneToOne: false
            referencedRelation: "Payment"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      StockTransaction: {
        Row: {
          actorid: string | null
          balanceafter: number | null
          createdAt: string
          id: string
          materialId: string
          notes: string | null
          organizationid: string | null
          quantity: number
          reference: string | null
          type: Database["public"]["Enums"]["TransactionType"]
        }
        Insert: {
          actorid?: string | null
          balanceafter?: number | null
          createdAt?: string
          id: string
          materialId: string
          notes?: string | null
          organizationid?: string | null
          quantity: number
          reference?: string | null
          type: Database["public"]["Enums"]["TransactionType"]
        }
        Update: {
          actorid?: string | null
          balanceafter?: number | null
          createdAt?: string
          id?: string
          materialId?: string
          notes?: string | null
          organizationid?: string | null
          quantity?: number
          reference?: string | null
          type?: Database["public"]["Enums"]["TransactionType"]
        }
        Relationships: [
          {
            foreignKeyName: "StockTransaction_actorid_fkey"
            columns: ["actorid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockTransaction_materialId_fkey"
            columns: ["materialId"]
            isOneToOne: false
            referencedRelation: "Material"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockTransaction_organizationid_fkey"
            columns: ["organizationid"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      SystemSettings: {
        Row: {
          category: string | null
          id: string
          key: string
          organizationid: string | null
          updatedat: string | null
          updatedby: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          id?: string
          key: string
          organizationid?: string | null
          updatedat?: string | null
          updatedby?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          id?: string
          key?: string
          organizationid?: string | null
          updatedat?: string | null
          updatedby?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "SystemSettings_organizationid_fkey"
            columns: ["organizationid"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "SystemSettings_updatedby_fkey"
            columns: ["updatedby"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization: { Args: never; Returns: string }
    }
    Enums: {
      DocumentStatus:
      | "DRAFT"
      | "SENT"
      | "PARTIAL"
      | "PAID"
      | "VOID"
      | "ACCEPTED"
      | "REJECTED"
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
      DocumentStatus: [
        "DRAFT",
        "SENT",
        "PARTIAL",
        "PAID",
        "VOID",
        "ACCEPTED",
        "REJECTED",
      ],
      MaterialType: ["VINYL", "SUBSTRATE", "LAMINATE", "INK", "OTHER"],
      TransactionType: ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"],
      UnitType: ["SQM", "LINEAR_METER", "PIECE"],
    },
  },
} as const
