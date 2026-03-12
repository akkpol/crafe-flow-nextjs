# วิธีแก้ปัญหา RLS Migration

## ปัญหาที่พบ
1. **REV-002**: profiles.organization_id ไม่มีในตาราง
2. **REV-003**: 13 ตารางมี RLS enabled แต่ไม่มี policies
3. **REV-004**: Policy creation ไม่ใช่ idempotent
4. **REV-005**: ชื่อคอลัมน์ไม่ตรงกัน (organization_id vs organizationId)

## ขั้นตอนการแก้ไข

### 1. Backup ข้อมูล (จำเป็นมาก)
```sql
-- สร้าง backup ก่อนรัน migration
CREATE TABLE profiles_backup AS SELECT * FROM profiles;
CREATE TABLE Customer_backup AS SELECT * FROM "Customer";
-- ... backup ตารางสำคัญอื่นๆ
```

### 2. รัน Migration ตามลำดับ

#### Step 1: เพิ่มคอลัมน์ organization_id
```bash
# ใน Supabase SQL Editor
-- รันไฟล์: 006_fix_profiles_organization.sql
```

#### Step 2: รัน RLS ที่แก้ไขแล้ว
```bash
# ใน Supabase SQL Editor  
-- รันไฟล์: 007_wave_e_rls_fixed.sql
```

### 3. ตรวจสอบผลลัพธ์

#### ตรวจสอบคอลัมน์ใหม่
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'organization_id';
```

#### ตรวจสอบ RLS Policies
```sql
-- ตรวจสอบว่ามี policies ครบถ้วน
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

#### ทดสอบการทำงาน
```sql
-- ทดสอบด้วย user ธรรมดา
SET ROLE authenticated;
SELECT COUNT(*) FROM "Customer"; -- ควรเห็นเฉพาะของ org ตัวเอง
```

### 4. การจัดการกรณีพิเศษ

#### ถ้ามี users หลาย organization
```sql
-- ต้อง backfill organization_id ให้ถูกต้อง
UPDATE profiles 
SET organization_id = 'org-id-ที่ถูกต้อง'
WHERE email = 'user@example.com';
```

#### ถ้าต้องการ rollback
```sql
-- ปิด RLS ชั่วคราว
ALTER TABLE "Customer" DISABLE ROW LEVEL SECURITY;
-- ... ทำเหมือนกันสำหรับทุกตาราง
```

## คำเตือน
- **อย่ารัน migration เก่า (005)** จะทำให้ระบบหยุดทำงานทันที
- **ต้อง backup ข้อมูลก่อน** เสมอ
- **ทดสอบใน staging ก่อน production** อย่างยิ่งยวด

## ตรวจสอบหลังรัน
1. ทดสอบ login ด้วย user ทั่วไป
2. ตรวจสอบว่าเห็นเฉพาะข้อมูล organization ตัวเอง
3. ทดสอบ create/read/update/delete ในทุกตาราง
4. ตรวจสอบ log ว่าไม่มีข้อผิดพลาด

## ไฟล์ที่เกี่ยวข้อง
- `006_fix_profiles_organization.sql` - เพิ่มคอลัมน์ organization_id
- `007_wave_e_rls_fixed.sql` - RLS policies ที่แก้ไขแล้ว
- `005_wave_e_rls_policies.sql` - **อย่าใช้** มีปัญหา
