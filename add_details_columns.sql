ALTER TABLE restaurants 
ADD COLUMN description TEXT NULL,
ADD COLUMN parking_info TEXT NULL,
ADD COLUMN transportation TEXT NULL,
ADD COLUMN special_notes TEXT NULL,
ADD COLUMN card_payment VARCHAR(10) NULL,
ADD COLUMN cash_payment VARCHAR(10) NULL,
ADD COLUMN mobile_payment VARCHAR(10) NULL,
ADD COLUMN account_transfer VARCHAR(10) NULL;

