import re
import sys

# Set standard output encoding to utf-8 if possible
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def audit_sql_seed():
    print("\n============================================================")
    print("  CREATOR PROFILE DATABASE SQL SEED AUDIT")
    print("============================================================")

    sql_file = "seed_dummy_creators.sql"
    with open(sql_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract Profiles inserted
    profiles = re.findall(r"\('(d1000000-[^']+)',\s*'([^']+)',\s*'([^']+)'", content)
    print(f"\n[OK] Found {len(profiles)} public.profiles records in {sql_file}:")
    for id_val, email, name in profiles:
        print(f"   * [{id_val}] {name} <{email}>")

    # Extract Roster records inserted
    roster_records = re.findall(r"\(\s*'e3000000-[^']+',\s*'(d1000000-[^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*(\d+)", content)
    print(f"\n[OK] Found {len(roster_records)} public.creator_roster records in {sql_file}:")
    for r in roster_records:
        profile_id, niche, yt_subs, yt_num, insta_subs, insta_num = r
        print(f"   * Profile ID: {profile_id} | Niche: {niche:20s} | YT: {yt_subs:6s} | IG: {insta_subs:6s}")

    # Check newly added creators in SQL
    kavya_sql = "kavya@creatornest.in" in content and "Kavya Nair" in content
    devansh_sql = "devansh@creatornest.in" in content and "Devansh Malhotra" in content

    print("\n------------------------------------------------------------")
    print("  SQL DEMO DATA AUDIT VERIFICATION:")
    print(f"  * Creator 11 (Kavya Nair - Tech & AI) in SQL        : {'PASSED' if kavya_sql else 'FAILED'}")
    print(f"  * Creator 12 (Devansh Malhotra - Fitness) in SQL   : {'PASSED' if devansh_sql else 'FAILED'}")
    print("------------------------------------------------------------\n")

if __name__ == "__main__":
    audit_sql_seed()
