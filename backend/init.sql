-- Insurance Company Database Initialization
-- Encoding: UTF-8

CREATE TYPE gender_enum AS ENUM ('M', 'F');

CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    inn_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE,
    gender gender_enum
);

CREATE TABLE agents (
    person_id INT PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE
);

CREATE TABLE clients (
    person_id INT PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
    risk_level VARCHAR(50)
);

CREATE TABLE relatives (
    client_id INT REFERENCES clients(person_id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    relationship_type VARCHAR(50),
    PRIMARY KEY (client_id, full_name)
);

CREATE TABLE vehicles (
    vin_code VARCHAR(17) PRIMARY KEY,
    plate_number VARCHAR(15),
    manufacture_year INT,
    car_type VARCHAR(50)
);

CREATE TABLE client_vehicles (
    client_id INT REFERENCES clients(person_id) ON DELETE CASCADE,
    vehicle_vin VARCHAR(17) REFERENCES vehicles(vin_code) ON DELETE CASCADE,
    PRIMARY KEY (client_id, vehicle_vin)
);

CREATE TABLE risks (
    id SERIAL PRIMARY KEY,
    risk_type VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE insurance_policies (
    policy_code VARCHAR(50) PRIMARY KEY,
    insurance_sum DECIMAL(15,2),
    issue_date DATE,
    expiry_date DATE,
    agent_id INT REFERENCES agents(person_id) ON DELETE SET NULL,
    client_id INT REFERENCES clients(person_id) ON DELETE CASCADE,
    vehicle_vin VARCHAR(17) REFERENCES vehicles(vin_code) ON DELETE CASCADE
);

CREATE TABLE policy_risks (
    policy_code VARCHAR(50) REFERENCES insurance_policies(policy_code) ON DELETE CASCADE,
    risk_id INT REFERENCES risks(id) ON DELETE CASCADE,
    PRIMARY KEY (policy_code, risk_id)
);

CREATE TABLE marriages (
    id SERIAL PRIMARY KEY,
    husband_id INT REFERENCES clients(person_id) ON DELETE CASCADE,
    wife_id INT REFERENCES clients(person_id) ON DELETE CASCADE,
    marriage_date DATE,
    UNIQUE (husband_id, wife_id),
    CHECK (husband_id != wife_id)
);

-- Seed Data
INSERT INTO people (inn_code, full_name, birth_date, gender) VALUES
('1000000001', 'Петренко Олександр Іванович', '1985-05-20', 'M'),
('1000000002', 'Коваленко Настя Петрівна', '1990-08-15', 'F'),
('2000000001', 'Мельник Іван Сергійович', '1988-03-10', 'M'),
('2000000002', 'Сидоренко Олена Василівна', '1992-11-25', 'F'),
('2000000003', 'Бондар Петро Олексійович', '1975-01-30', 'M'),
('3000000001', 'Іваненко Марія Олегівна', '1995-07-12', 'F'),
('3000000002', 'Шевченко Андрій Миколайович', '1982-04-22', 'M');

INSERT INTO agents (person_id, license_number, start_date) VALUES
(1, 'LIC-2023-001', '2020-01-10'),
(2, 'LIC-2023-002', '2021-06-15');

INSERT INTO clients (person_id, risk_level) VALUES
(3, 'Low'), (4, 'Medium'), (5, 'High'), (6, 'Low'), (7, 'Medium');

INSERT INTO relatives (client_id, full_name, relationship_type) VALUES
(3, 'Мельник Сергій Іванович', 'Батько'),
(3, 'Мельник Оксана Петрівна', 'Мати'),
(4, 'Сидоренко Василь Петрович', 'Батько'),
(5, 'Бондар Олексій Іванович', 'Батько');

INSERT INTO vehicles (vin_code, plate_number, manufacture_year, car_type) VALUES
('VIN11111111111111', 'AA1234BB', 2018, 'Sedan'),
('VIN22222222222222', 'BC5678KE', 2020, 'SUV'),
('VIN33333333333333', 'AI9090HM', 2015, 'Hatchback'),
('VIN44444444444444', 'KA1111AA', 2022, 'SUV'),
('VIN55555555555555', 'KA2222BB', 2019, 'Sedan');

INSERT INTO client_vehicles (client_id, vehicle_vin) VALUES
(3, 'VIN11111111111111'), (4, 'VIN22222222222222'),
(5, 'VIN33333333333333'), (6, 'VIN44444444444444'),
(7, 'VIN55555555555555');

INSERT INTO risks (risk_type) VALUES
('Викрадення'), ('ДТП'), ('Стихійне лихо'), ('Пожежа'), ('Вандалізм');

INSERT INTO insurance_policies (policy_code, insurance_sum, issue_date, expiry_date, agent_id, client_id, vehicle_vin) VALUES
('POL-2024-001', 500000.00, '2024-01-01', '2025-01-01', 1, 3, 'VIN11111111111111'),
('POL-2024-002', 750000.00, '2024-02-01', '2025-02-01', 2, 4, 'VIN22222222222222'),
('POL-2024-003', 200000.00, '2024-03-01', '2024-09-01', 1, 5, 'VIN33333333333333'),
('POL-2024-004', 900000.00, '2024-04-01', '2025-04-01', NULL, 6, 'VIN44444444444444'),
('POL-2024-005', 350000.00, '2024-05-01', '2025-05-01', 2, 7, 'VIN55555555555555');

INSERT INTO policy_risks (policy_code, risk_id) VALUES
('POL-2024-001', 1), ('POL-2024-001', 2), ('POL-2024-001', 3),
('POL-2024-002', 2), ('POL-2024-002', 3),
('POL-2024-003', 2),
('POL-2024-004', 1), ('POL-2024-004', 2), ('POL-2024-004', 3), ('POL-2024-004', 4), ('POL-2024-004', 5),
('POL-2024-005', 1), ('POL-2024-005', 2);

INSERT INTO marriages (husband_id, wife_id, marriage_date) VALUES
(3, 4, '2015-09-20'), (5, 6, '2010-06-15');
