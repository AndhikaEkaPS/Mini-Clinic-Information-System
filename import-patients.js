require('dotenv').config();
const mysql = require('mysql2/promise');

const patients = [
  { nik: '3275041203981021', name: 'Aisyah Nurmalasari',      gender: 'female', date_of_birth: '1998-04-12', phone: '0812-3401-5567', address: 'Jl. Melur No. 12, Bandung' },
  { nik: '3276032201052042', name: 'Reza Ramadhan',            gender: 'male',   date_of_birth: '2005-01-22', phone: '0813-2210-7744', address: 'Jl. Kenanga Raya No. 8, Bandung' },
  { nik: '3277080909113073', name: 'Nadia Azzahra',            gender: 'female', date_of_birth: '1991-11-09', phone: '0811-9098-1122', address: 'Jl. Kamboja No. 45, Cimahi' },
  { nik: '3279122812764074', name: 'Muhammad Rifky Pratama',   gender: 'male',   date_of_birth: '1976-12-28', phone: '0821-7012-3344', address: 'Jl. Anggrek No. 3, Bandung Barat' },
  { nik: '3273011508845085', name: 'Salma Zahra',              gender: 'female', date_of_birth: '1984-08-15', phone: '0812-5678-9910', address: 'Jl. Cendana No. 19, Bandung' },
  { nik: '3278050709206096', name: 'Agung Saputra',            gender: 'male',   date_of_birth: '1992-09-07', phone: '0813-4443-2121', address: 'Jl. Sukamaju No. 77, Cimahi' },
  { nik: '3276012619907107', name: 'Putri Maharani',           gender: 'female', date_of_birth: '1990-10-26', phone: '0822-1122-8899', address: 'Jl. Siliwangi No. 26, Bandung' },
  { nik: '3277041907738118', name: 'Teuku Dimas Alfarizi',     gender: 'male',   date_of_birth: '1973-07-19', phone: '0812-3000-4477', address: 'Jl. Pasirkaliki No. 5, Bandung' },
  { nik: '3275080411098129', name: 'Febrianti Kusuma',         gender: 'female', date_of_birth: '1999-11-04', phone: '0813-6001-2233', address: 'Jl. Garuda No. 14, Cimahi' },
  { nik: '3274092305869130', name: 'Rahmat Hidayat',           gender: 'male',   date_of_birth: '1986-05-23', phone: '0821-8899-1001', address: 'Jl. Buni No. 9, Bandung' },
  { nik: '3272021203449141', name: 'Kirana Putri Lestari',     gender: 'female', date_of_birth: '1994-03-12', phone: '0811-2213-4500', address: 'Jl. Citarum No. 31, Bandung' },
  { nik: '3277012809012152', name: 'Daniel Pratama',           gender: 'male',   date_of_birth: '2001-09-28', phone: '0812-7777-9090', address: 'Jl. Setiabudi No. 2, Bandung' },
  { nik: '3276051107303163', name: 'Salsabila Aulia',          gender: 'female', date_of_birth: '1998-07-11', phone: '0813-1597-2600', address: 'Jl. Tamansari No. 60, Cimahi' },
  { nik: '3278042604124174', name: 'Bagus Tri Wicaksono',      gender: 'male',   date_of_birth: '1991-04-26', phone: '0822-6000-1300', address: 'Jl. Melati No. 21, Bandung' },
  { nik: '3273101909555185', name: 'Nurhayati',                gender: 'female', date_of_birth: '1995-09-19', phone: '0811-8833-2211', address: 'Jl. Sarijadi No. 18, Bandung' },
  { nik: '3279090701316196', name: 'Ahmad Zidan Saputra',      gender: 'male',   date_of_birth: '1996-01-07', phone: '0812-9044-6655', address: 'Jl. Kiaracondong No. 9, Bandung' },
  { nik: '3278060204067197', name: 'Intan Lestari',            gender: 'female', date_of_birth: '1997-04-02', phone: '0813-1200-9800', address: 'Jl. Rancabolang No. 33, Bandung' },
  { nik: '3275032107888208', name: 'Rizky Maulana',            gender: 'male',   date_of_birth: '1988-07-21', phone: '0821-4400-5566', address: 'Jl. Baros No. 7, Cimahi' },
  { nik: '3277010906169219', name: 'Monica Arum Sari',         gender: 'female', date_of_birth: '1996-06-09', phone: '0812-3344-7788', address: 'Jl. Dago No. 41, Bandung' },
  { nik: '3276121705173220', name: 'Fajar Hidayah',            gender: 'male',   date_of_birth: '2002-05-17', phone: '0811-9911-2222', address: 'Jl. Gegerkalong No. 10, Bandung' },
  { nik: '3278112506304231', name: 'Larasati Putri',           gender: 'female', date_of_birth: '2000-06-25', phone: '0822-7007-8080', address: 'Jl. Padalarang No. 12, Bandung Barat' },
  { nik: '3273031207015242', name: 'Aditya Nugraha',           gender: 'male',   date_of_birth: '1995-07-12', phone: '0813-5050-6060', address: 'Jl. Cimindi No. 27, Bandung' },
  { nik: '3274080608136253', name: 'Siti Aisyah',              gender: 'female', date_of_birth: '1993-08-06', phone: '0812-1212-3434', address: 'Jl. Cikutra No. 6, Bandung' },
  { nik: '3277071509267264', name: 'Victor Arya Putra',        gender: 'male',   date_of_birth: '1999-09-15', phone: '0821-6543-2100', address: 'Jl. Kopo No. 88, Bandung' },
  { nik: '3276050501448275', name: 'Ummi Rahma',               gender: 'female', date_of_birth: '1985-01-05', phone: '0811-2211-8899', address: 'Jl. Buah Batu No. 25, Bandung' },
  { nik: '3279112203579286', name: 'Dwi Cahyani',              gender: 'female', date_of_birth: '1997-03-22', phone: '0813-777-1212',  address: 'Jl. Sukagalih No. 14, Bandung' },
  { nik: '3275022804660297', name: 'Farhan Kurniawan',         gender: 'male',   date_of_birth: '1986-04-28', phone: '0822-8888-9090', address: 'Jl. Cisaranten No. 3, Bandung' },
  { nik: '3273091107581308', name: 'Melani Putri',             gender: 'female', date_of_birth: '1998-07-11', phone: '0812-4500-6700', address: 'Jl. Pasirjati No. 55, Bandung' },
  { nik: '3278050409311319', name: 'Reynaldo Pratama',         gender: 'male',   date_of_birth: '1991-09-04', phone: '0813-3300-9900', address: 'Jl. Cibabat No. 20, Cimahi' },
  { nik: '3277031606242320', name: 'Chandra Wijaya',           gender: 'male',   date_of_birth: '2000-06-16', phone: '0821-7770-2220', address: 'Jl. Setrasari No. 9, Bandung' },
  { nik: '3276102503833331', name: 'Tiara Safitri',            gender: 'female', date_of_birth: '1983-03-25', phone: '0811-1234-5678', address: 'Jl. Tamansari No. 71, Bandung' },
  { nik: '3278040112944342', name: 'Rizal Maulana',            gender: 'male',   date_of_birth: '1994-12-01', phone: '0812-6000-1000', address: 'Jl. Kopo Permai No. 15, Bandung' },
  { nik: '3274092306755353', name: 'Dea Puspita',              gender: 'female', date_of_birth: '1995-06-23', phone: '0822-3333-4444', address: 'Jl. Antapani No. 2, Bandung' },
  { nik: '3275061508046364', name: 'Naufal Rachman',           gender: 'male',   date_of_birth: '1997-08-15', phone: '0813-8888-1212', address: 'Jl. Dago Timur No. 28, Bandung' },
  { nik: '3277122709167375', name: 'Hana Zahira',              gender: 'female', date_of_birth: '1996-09-27', phone: '0812-1111-6565', address: 'Jl. Sadang Serang No. 4, Bandung' },
  { nik: '3273010507358386', name: 'Bimo Pratama',             gender: 'male',   date_of_birth: '1986-07-05', phone: '0821-2222-7878', address: 'Jl. Cimareme No. 19, Bandung' },
  { nik: '3279082604189397', name: 'Prameswari Anggun',        gender: 'female', date_of_birth: '1993-04-26', phone: '0811-9090-7070', address: 'Jl. Cibiru No. 12, Bandung' },
  { nik: '3276072305520408', name: 'Akbar Maulana',            gender: 'male',   date_of_birth: '2002-05-23', phone: '0812-4444-5151', address: 'Jl. Soreang No. 36, Bandung' },
  { nik: '3277021103691419', name: 'Arimbi Lestari',           gender: 'female', date_of_birth: '1999-03-11', phone: '0822-1212-3433', address: 'Jl. Sarimukti No. 6, Bandung' },
  { nik: '3276032901472420', name: 'Chintya Permata',          gender: 'female', date_of_birth: '1997-01-29', phone: '0813-2222-4545', address: 'Jl. Sukaraja No. 24, Cimahi' },
  { nik: '3275100907843431', name: 'Niko Saputra',             gender: 'male',   date_of_birth: '1984-07-09', phone: '0811-3333-6666', address: 'Jl. Cimahi Selatan No. 8, Cimahi' },
  { nik: '3278022405194442', name: 'Rina Amelia',              gender: 'female', date_of_birth: '1994-05-24', phone: '0812-5555-7777', address: 'Jl. Buahbatu No. 90, Bandung' },
  { nik: '3274041206925453', name: 'Agnes Kartika',            gender: 'female', date_of_birth: '1992-06-12', phone: '0821-1234-8888', address: 'Jl. Cibeureum No. 17, Bandung' },
  { nik: '3277110503786464', name: 'Setyo Wicaksono',          gender: 'male',   date_of_birth: '1978-03-05', phone: '0813-9999-0000', address: 'Jl. Palasari No. 1, Bandung' },
  { nik: '3275032104407475', name: 'Khairunisa',               gender: 'female', date_of_birth: '2001-04-21', phone: '0812-6161-7878', address: 'Jl. Suci No. 23, Cimahi' },
  { nik: '3276103005158486', name: 'Fatih Ramadhan',           gender: 'male',   date_of_birth: '1985-05-30', phone: '0822-4444-3333', address: 'Jl. Margahayu No. 11, Bandung' },
  { nik: '3277071609469497', name: 'Anisa Putri Ramadhani',    gender: 'female', date_of_birth: '1996-09-16', phone: '0811-7070-2020', address: 'Jl. Sukamiskin No. 29, Bandung' },
  { nik: '3278040503270508', name: 'Galang Putra Pratama',     gender: 'male',   date_of_birth: '2000-03-05', phone: '0812-3030-4040', address: 'Jl. Soekarno Hatta No. 7, Bandung' },
  { nik: '3279122208391519', name: 'Sarah Azzura',             gender: 'female', date_of_birth: '1999-08-22', phone: '0813-4545-5656', address: 'Jl. Pasirkaliki No. 50, Bandung' },
  { nik: '3275050702509520', name: 'Rizky Ananda',             gender: 'male',   date_of_birth: '1995-02-07', phone: '0821-5656-6767', address: 'Jl. Kiarapayung No. 13, Bandung' },
  { nik: '3274011806073531', name: 'Dina Lutfia',              gender: 'female', date_of_birth: '2003-06-18', phone: '0811-1212-9191', address: 'Jl. Cimenyan No. 44, Bandung' },
  { nik: '3276082907444542', name: 'Pramudya Rafli',           gender: 'male',   date_of_birth: '1994-07-29', phone: '0812-8080-7070', address: 'Jl. Cijerah No. 16, Bandung' },
  { nik: '3277031605325553', name: 'Fitri Ayu Lestari',        gender: 'female', date_of_birth: '1992-05-16', phone: '0822-9090-8181', address: 'Jl. Antapani Tengah No. 6, Bandung' },
  { nik: '3279100103766564', name: 'Gilang Pratama',           gender: 'male',   date_of_birth: '1986-03-01', phone: '0813-3131-4242', address: 'Jl. Cimahi Utara No. 3, Cimahi' },
  { nik: '3276011204897575', name: 'Tasya Kurnia',             gender: 'female', date_of_birth: '1989-04-12', phone: '0812-2424-3434', address: 'Jl. Setiabudi No. 19, Bandung' },
  { nik: '3277042605718586', name: 'Febrian Hidayat',          gender: 'male',   date_of_birth: '2001-05-26', phone: '0821-5654-1234', address: 'Jl. Siliwangi No. 62, Bandung' },
  { nik: '3275030902309597', name: 'Selvi Nurhayati',          gender: 'female', date_of_birth: '1997-02-09', phone: '0811-6767-8787', address: 'Jl. Buah Batu No. 31, Bandung' },
  { nik: '3278071409910608', name: 'Maulana Fariz',            gender: 'male',   date_of_birth: '1991-09-14', phone: '0813-9898-1111', address: 'Jl. Cibeber No. 10, Cimahi' },
  { nik: '3274111706541619', name: 'Melati Salsabila',         gender: 'female', date_of_birth: '1996-06-17', phone: '0822-2223-3334', address: 'Jl. Sukamaju Baru No. 27, Bandung' },
  { nik: '3276092503872620', name: 'Rendy Putra',              gender: 'male',   date_of_birth: '1987-03-25', phone: '0812-3333-1111', address: 'Jl. Cigondewah No. 5, Bandung' },
  { nik: '3277101204183631', name: 'Nurul Aulia',              gender: 'female', date_of_birth: '1995-04-12', phone: '0811-4444-2222', address: 'Jl. Taman Sari No. 8, Bandung' },
  { nik: '3278050601594642', name: 'Raka Pratama',             gender: 'male',   date_of_birth: '2002-01-06', phone: '0821-5555-6666', address: 'Jl. Arcamanik No. 73, Bandung' },
  { nik: '3274022809915653', name: 'Lestari Wulandari',        gender: 'female', date_of_birth: '1991-09-28', phone: '0813-7777-8888', address: 'Jl. Ujung Berung No. 14, Bandung' },
  { nik: '3276071903766664', name: 'Adelina Putri',            gender: 'female', date_of_birth: '1996-03-19', phone: '0812-1211-5656', address: 'Jl. Bandung Kidul No. 2, Bandung' },
  { nik: '3279032208147675', name: 'Arif Rahman',              gender: 'male',   date_of_birth: '1975-08-22', phone: '0822-3331-4442', address: 'Jl. Cipadung No. 21, Bandung' },
  { nik: '3275041506908686', name: 'Putri Kinasih',            gender: 'female', date_of_birth: '1990-06-15', phone: '0811-9091-1010', address: 'Jl. Leuwi Panjang No. 16, Bandung' },
  { nik: '3277010304759697', name: 'Zahra Nabila',             gender: 'female', date_of_birth: '1997-04-03', phone: '0813-5051-9090', address: 'Jl. Bandung Kulon No. 9, Bandung' },
  { nik: '3278062506120708', name: 'Alif Hidayat',             gender: 'male',   date_of_birth: '2000-06-25', phone: '0821-1213-1415', address: 'Jl. Cimareme No. 12, Bandung' },
  { nik: '3274110908431719', name: 'Intan Maulida',            gender: 'female', date_of_birth: '1999-08-09', phone: '0812-6868-7474', address: 'Jl. Margacinta No. 44, Bandung' },
  { nik: '3276031605212720', name: 'Kevin Prakoso',            gender: 'male',   date_of_birth: '1991-05-16', phone: '0813-7575-5655', address: 'Jl. Sukajadi No. 6, Bandung' },
  { nik: '3277082403163731', name: 'Serena Putri',             gender: 'female', date_of_birth: '1996-03-24', phone: '0822-8181-9191', address: 'Jl. Pasirkaliki No. 90, Bandung' },
  { nik: '3275011209514742', name: 'Dodi Setiawan',            gender: 'male',   date_of_birth: '1995-09-12', phone: '0811-3434-4545', address: 'Jl. Antapani No. 33, Bandung' },
  { nik: '3279020708325753', name: 'Husna Azzahra',            gender: 'female', date_of_birth: '1982-08-07', phone: '0821-5757-6666', address: 'Jl. Cimahi Tengah No. 18, Cimahi' },
  { nik: '3277042604916764', name: 'Reza Pratama',             gender: 'male',   date_of_birth: '1996-04-26', phone: '0812-4646-5757', address: 'Jl. Leuwipanjang No. 1, Bandung' },
  { nik: '3276061503207775', name: 'Nabila Rahmi',             gender: 'female', date_of_birth: '1975-03-15', phone: '0813-0909-2020', address: 'Jl. Dago Atas No. 12, Bandung' },
  { nik: '3275082906478786', name: 'Agus Saputra',             gender: 'male',   date_of_birth: '1986-06-29', phone: '0822-3030-4041', address: 'Jl. Bojongsoang No. 28, Bandung' },
  { nik: '3278010507819797', name: 'Syifa Azzura',             gender: 'female', date_of_birth: '1997-07-05', phone: '0811-6161-7171', address: 'Jl. Kopo Permai No. 9, Bandung' },
  { nik: '3274132203490808', name: 'Yusuf Maulana',            gender: 'male',   date_of_birth: '2000-03-22', phone: '0812-8081-9092', address: 'Jl. Rancaekek No. 17, Bandung' },
  { nik: '3276041605601819', name: 'Putri Anggun',             gender: 'female', date_of_birth: '1981-05-16', phone: '0821-4546-5657', address: 'Jl. Cibiru Hilir No. 3, Bandung' },
  { nik: '3273021405021820', name: 'Andi Hermawan',         gender: 'male',   date_of_birth: '2002-05-14', phone: '0812-9876-5432', address: 'Jl. Sunda No. 15, Bandung' },
  { nik: '3275065208952831', name: 'Citra Kirana',          gender: 'female', date_of_birth: '1995-08-12', phone: '0813-1122-3344', address: 'Jl. Riau No. 88, Bandung' },
  { nik: '3276082010893842', name: 'Bambang Trihatmojo',    gender: 'male',   date_of_birth: '1989-10-20', phone: '0821-4433-2211', address: 'Jl. Pasteur No. 42, Bandung' },
  { nik: '3277016103934853', name: 'Dina Mariani',          gender: 'female', date_of_birth: '1993-03-21', phone: '0811-5566-7788', address: 'Jl. Gatot Subroto No. 10, Cimahi' },
  { nik: '3278051806015864', name: 'Eko Prasetyo',          gender: 'male',   date_of_birth: '2001-06-18', phone: '0822-9900-1122', address: 'Jl. Burangrang No. 7, Bandung' },
  { nik: '3279094501976875', name: 'Fadhilah Nurul',        gender: 'female', date_of_birth: '1997-01-05', phone: '0812-3322-1100', address: 'Jl. Asia Afrika No. 101, Bandung' },
  { nik: '3273040309857886', name: 'Guruh Soekarno',        gender: 'male',   date_of_birth: '1985-09-03', phone: '0813-7788-9900', address: 'Jl. Pajajaran No. 54, Bandung' },
  { nik: '3275076512988897', name: 'Hani Handayani',        gender: 'female', date_of_birth: '1998-12-25', phone: '0821-6655-4433', address: 'Jl. Cihampelas No. 120, Bandung' },
  { nik: '3276021104039908', name: 'Irfan Bachdim',         gender: 'male',   date_of_birth: '2003-04-11', phone: '0811-2233-4455', address: 'Jl. Surya Sumantri No. 18, Bandung' },
  { nik: '3277095907920919', name: 'Jasmine Indah',         gender: 'female', date_of_birth: '1992-07-19', phone: '0822-8877-6655', address: 'Jl. Terusan Buah Batu No. 45, Bandung' },
  { nik: '3278030802881920', name: 'Kurnia Meiga',          gender: 'male',   date_of_birth: '1988-02-08', phone: '0812-4455-6677', address: 'Jl. Mahar Martanegara No. 9, Cimahi' },
  { nik: '3279116710962931', name: 'Lia Lestari',           gender: 'female', date_of_birth: '1996-10-27', phone: '0813-9988-7766', address: 'Jl. Soreang No. 3, Bandung' },
  { nik: '3273052206043942', name: 'Mochamad Iriawan',      gender: 'male',   date_of_birth: '2004-06-22', phone: '0821-1122-3344', address: 'Jl. Laswi No. 16, Bandung' },
  { nik: '3275087009904953', name: 'Nabila Syakieb',        gender: 'female', date_of_birth: '1990-09-30', phone: '0811-3344-5566', address: 'Jl. Dipati Ukur No. 22, Bandung' },
  { nik: '3276010511875964', name: 'Oky Setiana',           gender: 'male',   date_of_birth: '1987-11-05', phone: '0822-5566-7788', address: 'Jl. Lembang No. 80, Bandung Barat' },
  { nik: '3277044808016975', name: 'Priscillia Sari',       gender: 'female', date_of_birth: '2001-08-08', phone: '0812-6677-8899', address: 'Jl. Cijagra No. 11, Bandung' },
  { nik: '3278091703997986', name: 'Qosim Rahardian',       gender: 'male',   date_of_birth: '1999-03-17', phone: '0813-2233-4455', address: 'Jl. Amir Machmud No. 150, Cimahi' },
  { nik: '3279026305948997', name: 'Ratu Elisabeth',        gender: 'female', date_of_birth: '1994-05-23', phone: '0821-8899-0011', address: 'Jl. Caringin No. 29, Bandung' },
  { nik: '3273101010869008', name: 'Satria Pratama',        gender: 'male',   date_of_birth: '1986-10-10', phone: '0811-4455-6677', address: 'Jl. Sukajadi No. 112, Bandung' },
  { nik: '3275125404980119', name: 'Tania Nadira',          gender: 'female', date_of_birth: '1998-04-14', phone: '0822-7788-9900', address: 'Jl. Ibrahim Adjie No. 67, Bandung' },
  { nik: '3276070107001220', name: 'Umar Farooq',           gender: 'male',   date_of_birth: '2000-07-01', phone: '0812-1133-5577', address: 'Jl. Batununggal No. 5, Bandung' },
];

function generateRM(seq) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `RM-${date}-${String(seq).padStart(4, '0')}`;
}

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'clinic_db',
  });

  console.log('Terhubung ke database\n');

  // STEP 1: Cek & perbaiki struktur kolom id
  console.log('Mengecek struktur tabel patients...');
  const [cols] = await conn.execute('SHOW COLUMNS FROM patients');
  const idCol  = cols.find(c => c.Field === 'id');
  console.log('  Tipe id   :', idCol.Type);
  console.log('  Extra     :', idCol.Extra);

  if (!idCol.Extra.includes('auto_increment')) {
    console.log('  Memperbaiki kolom id...');
    await conn.execute(
      'ALTER TABLE patients MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY'
    );
    console.log('  Kolom id berhasil diperbaiki\n');
  } else {
    console.log('  Struktur id sudah benar\n');
  }

  // STEP 1b: Cek & perbaiki counter AUTO_INCREMENT yang keluar batas int(11)
  // Ini yang kemarin bikin "Out of range value for column 'id'" walau tabel kosong,
  // karena counter-nya sempat tersimpan sebesar 2147483648 dari percobaan sebelumnya.
  const INT_MAX = 2147483647;
  const [[aiRow]] = await conn.execute(
    `SELECT AUTO_INCREMENT AS next_id
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients'`
  );
  console.log('  AUTO_INCREMENT saat ini:', aiRow.next_id);
  if (aiRow.next_id === null || aiRow.next_id > INT_MAX) {
    console.log('  AUTO_INCREMENT di luar batas int(11), mereset ke 1...\n');
    await conn.execute('ALTER TABLE patients AUTO_INCREMENT = 1');
  } else {
    console.log('  AUTO_INCREMENT masih aman\n');
  }

  // STEP 2: Bersihkan data lama & reset counter
  // PENTING: reset AUTO_INCREMENT dijalankan TANPA SYARAT (tidak dibungkus if),
  // supaya tabel yang sudah kosong tapi counter-nya kebesaran tetap ikut direset.
  const [[{ total_before }]] = await conn.execute('SELECT COUNT(*) AS total_before FROM patients');
  console.log('Jumlah pasien di DB saat ini:', total_before);

  if (total_before > 0) {
    await conn.execute('DELETE FROM patients');
    console.log('Data lama dihapus');
  }
  await conn.execute('ALTER TABLE patients AUTO_INCREMENT = 1');
  console.log('AUTO_INCREMENT di-reset ke 1\n');

  // STEP 3: Import
  console.log('Memulai import...\n');
  let berhasil = 0, gagal = 0;

  for (let i = 0; i < patients.length; i++) {
    const p  = patients[i];
    const rm = generateRM(i + 1);
    try {
      await conn.execute(
        `INSERT INTO patients
           (medical_record_number, nik, name, gender, date_of_birth, phone, address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [rm, p.nik, p.name, p.gender, p.date_of_birth, p.phone, p.address]
      );
      console.log(`OK [${String(berhasil+1).padStart(2,'0')}] ${p.name.padEnd(30)} ${rm}`);
      berhasil++;
    } catch (err) {
      // Diagnostik lebih detail supaya gampang dilacak kalau ada error lain di kemudian hari
      console.log(`GAGAL: ${p.name} — ${err.message}`);
      if (err.sqlMessage) console.log('   SQL Message:', err.sqlMessage);
      gagal++;
    }
  }

  const [[{ total_after }]] = await conn.execute('SELECT COUNT(*) AS total_after FROM patients');

  console.log('\n==========================================');
  console.log('HASIL IMPORT:');
  console.log('  Berhasil :', berhasil, 'pasien');
  console.log('  Gagal    :', gagal,    'pasien');
  console.log('  Total DB :', total_after, 'pasien');
  console.log('==========================================');

  await conn.end();
  console.log('Selesai!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
