import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable
from sqlalchemy.dialects import postgresql

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../creator_nest_backend')))

from app.database.base import Base
from app.models.creator import Creator
from app.models.creator_platform import CreatorPlatform
from app.models.creator_deal_history import CreatorDealHistory
from app.models.creator_score import CreatorScore

engine = create_engine('postgresql://postgres:postgres@localhost/dummy')

with open('generated_ddl.sql', 'w') as f:
    for model in [Creator, CreatorPlatform, CreatorDealHistory, CreatorScore]:
        f.write(str(CreateTable(model.__table__).compile(engine)))
        f.write(";\n\n")

print("DDL generated to generated_ddl.sql")
