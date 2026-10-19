/* Measured interest profiles for Disha's careers, from O*NET.
   r = Occupational Interest scores on a 1–7 scale, in the order
       Realistic, Investigative, Artistic, Social, Enterprising, Conventional.
   soc = the O*NET-SOC occupations averaged for that Disha career.
   Careers missing here (ias, entrepreneur, defence) have no fair US equivalent
   and keep their hand-picked Holland code (careers.js).

   Source: O*NET 31.0 Database, "Career Interest Types" file, by the U.S.
   Department of Labor, Employment and Training Administration (USDOL/ETA).
   Used under the Creative Commons Attribution 4.0 International licence
   (https://creativecommons.org/licenses/by/4.0/). Changes made by Disha: related
   occupations averaged into one profile per career and rounded to 2 decimals.
   O*NET® is a trademark of USDOL/ETA. */
window.CAREER_ONET = {
  software: { soc: ["15-1252.00"], r: [3.61, 6.05, 2.37, 1.81, 1.87, 5.62] }, // Software Developers
  ai: { soc: ["15-2051.00","15-1221.00"], r: [2.96, 6.99, 2.78, 1.83, 2.10, 5.10] }, // Data Scientists; Computer and Information Research Scientists
  cyber: { soc: ["15-1212.00"], r: [3.56, 5.40, 1.34, 2.11, 2.85, 6.08] }, // Information Security Analysts
  gamedev: { soc: ["15-1255.01"], r: [2.77, 4.15, 6.38, 2.30, 3.92, 3.85] }, // Video Game Designers
  aerospace: { soc: ["17-2011.00"], r: [5.65, 6.05, 2.35, 1.25, 2.52, 4.44] }, // Aerospace Engineers
  engineer: { soc: ["17-2141.00","17-2051.00","17-2071.00"], r: [6.28, 5.24, 2.12, 1.54, 2.36, 4.62] }, // Mechanical Engineers; Civil Engineers; Electrical Engineers
  technician: { soc: ["47-2111.00","49-3023.00","51-4041.00"], r: [7.00, 3.33, 1.40, 1.31, 1.54, 4.27] }, // Electricians; Automotive Service Technicians and Mechanics; Machinists
  doctor: { soc: ["29-1215.00","29-1216.00"], r: [4.09, 6.45, 1.44, 6.15, 2.22, 3.79] }, // Family Medicine Physicians; General Internal Medicine Physicians
  dentist: { soc: ["29-1021.00"], r: [5.23, 5.48, 1.17, 4.41, 2.00, 3.71] }, // Dentists, General
  nurse: { soc: ["29-1141.00"], r: [3.46, 4.71, 1.34, 5.57, 2.38, 4.75] }, // Registered Nurses
  vet: { soc: ["29-1131.00"], r: [5.98, 5.98, 1.00, 3.45, 1.70, 3.47] }, // Veterinarians
  psychologist: { soc: ["19-3033.00","21-1014.00"], r: [1.18, 5.00, 3.06, 6.68, 2.81, 3.46] }, // Clinical and Counseling Psychologists; Mental Health Counselors
  scientist: { soc: ["19-2012.00","19-2031.00","19-1029.04"], r: [4.91, 6.90, 2.22, 1.96, 2.04, 4.69] }, // Physicists; Chemists; Biologists
  environment: { soc: ["19-2041.00","19-1032.00"], r: [5.04, 5.74, 1.56, 2.53, 3.17, 4.36] }, // Environmental Scientists and Specialists, Including Health; Foresters
  agri: { soc: ["19-1013.00","17-2021.00"], r: [6.54, 6.50, 2.15, 1.70, 2.01, 3.59] }, // Soil and Plant Scientists; Agricultural Engineers
  ca: { soc: ["13-2011.00"], r: [1.14, 3.57, 1.08, 2.13, 3.87, 7.00] }, // Accountants and Auditors
  finance: { soc: ["13-2051.00","41-3031.00"], r: [1.13, 3.80, 1.54, 2.66, 5.59, 5.40] }, // Financial and Investment Analysts; Securities, Commodities, and Financial Services Sales Agents
  manager: { soc: ["11-1021.00"], r: [2.20, 2.37, 1.29, 3.38, 7.00, 5.34] }, // General and Operations Managers
  marketing: { soc: ["11-2021.00"], r: [1.00, 2.90, 2.45, 2.82, 7.00, 4.70] }, // Marketing Managers
  economist: { soc: ["19-3011.00"], r: [1.35, 7.00, 2.43, 2.40, 3.93, 4.53] }, // Economists
  banking: { soc: ["13-2072.00"], r: [1.43, 2.32, 1.00, 3.65, 4.98, 6.08] }, // Loan Officers
  lawyer: { soc: ["23-1011.00"], r: [1.12, 4.38, 2.40, 3.48, 5.51, 4.59] }, // Lawyers
  architect: { soc: ["17-1011.00"], r: [4.92, 3.88, 4.13, 2.53, 3.65, 4.44] }, // Architects, Except Landscape and Naval
  ux: { soc: ["15-1255.00","27-1021.00"], r: [3.61, 4.47, 5.01, 2.02, 3.42, 3.94] }, // Web and Digital Interface Designers; Commercial and Industrial Designers
  fashion: { soc: ["27-1022.00"], r: [4.34, 2.17, 7.00, 2.35, 3.96, 2.94] }, // Fashion Designers
  animator: { soc: ["27-1014.00"], r: [3.71, 2.77, 7.00, 2.18, 2.62, 3.13] }, // Special Effects Artists and Animators
  journalist: { soc: ["27-3023.00"], r: [1.47, 4.16, 5.09, 2.80, 3.95, 3.64] }, // News Analysts, Reporters, and Journalists
  performer: { soc: ["27-2042.00","27-2031.00"], r: [3.85, 1.48, 6.53, 3.53, 3.30, 1.89] }, // Musicians and Singers; Dancers
  film: { soc: ["27-2012.00","27-2011.00"], r: [2.21, 2.20, 6.57, 3.60, 4.89, 2.69] }, // Producers and Directors; Actors
  teacher: { soc: ["25-2031.00","25-2021.00"], r: [2.69, 3.27, 3.82, 7.00, 2.74, 3.70] }, // Secondary School Teachers, Except Special and Career/Technical Education; Elementary School Teachers, Except Special Education
  social: { soc: ["21-1021.00","11-9151.00"], r: [1.35, 2.75, 2.67, 6.14, 4.96, 3.89] }, // Child, Family, and School Social Workers; Social and Community Service Managers
  sports: { soc: ["27-2021.00","27-2022.00"], r: [4.72, 1.78, 2.29, 4.81, 4.84, 3.23] }, // Athletes and Sports Competitors; Coaches and Scouts
  pilot: { soc: ["53-2011.00"], r: [4.74, 3.15, 1.44, 2.50, 3.81, 4.70] }, // Airline Pilots, Copilots, and Flight Engineers
  chef: { soc: ["35-1011.00","11-9051.00"], r: [4.50, 1.82, 2.17, 3.24, 5.55, 4.71] }, // Chefs and Head Cooks; Food Service Managers
  marine: { soc: ["19-1023.00","19-2043.00"], r: [5.64, 6.70, 1.97, 2.34, 2.31, 4.01] }, // Zoologists and Wildlife Biologists; Hydrologists
  forensic: { soc: ["19-4092.00"], r: [5.18, 5.94, 1.77, 1.50, 1.59, 4.98] }, // Forensic Science Technicians
  drone: { soc: ["53-2012.00","17-3021.00"], r: [5.63, 3.83, 1.05, 1.79, 2.68, 5.06] }, // Commercial Pilots; Aerospace Engineering and Operations Technologists and Technicians
  robotics: { soc: ["17-2199.08"], r: [6.18, 5.61, 1.79, 1.49, 1.79, 4.48] }, // Robotics Engineers
  climate: { soc: ["19-2041.01","17-2199.11","17-2199.10"], r: [4.41, 5.43, 2.48, 2.17, 3.62, 4.05] }, // Climate Change Policy Analysts; Solar Energy Systems Engineers; Wind Energy Engineers
  astro: { soc: ["19-2011.00"], r: [5.07, 7.00, 3.28, 2.71, 1.87, 4.04] }, // Astronomers
  biotech: { soc: ["19-1021.00","19-1029.04"], r: [4.61, 7.00, 2.51, 2.38, 2.30, 4.05] }, // Biochemists and Biophysicists; Biologists
  foodsci: { soc: ["19-1012.00"], r: [5.05, 5.71, 2.45, 2.16, 2.58, 3.95] }, // Food Scientists and Technologists
  wildlife: { soc: ["19-1023.00","27-4021.00"], r: [5.49, 4.59, 3.80, 2.25, 2.30, 3.53] }, // Zoologists and Wildlife Biologists; Photographers
  sound: { soc: ["27-4014.00","27-2041.00"], r: [3.60, 2.48, 5.73, 2.37, 3.49, 3.43] }, // Sound Engineering Technicians; Music Directors and Composers
  industrial: { soc: ["27-1021.00"], r: [4.62, 4.06, 5.54, 1.84, 3.70, 3.47] }, // Commercial and Industrial Designers
  archaeologist: { soc: ["19-3091.00","25-4012.00"], r: [3.23, 5.14, 3.60, 3.75, 2.74, 4.28] }, // Anthropologists and Archeologists; Curators
  linguist: { soc: ["27-3091.00"], r: [1.89, 3.19, 4.28, 3.48, 1.90, 4.79] } // Interpreters and Translators
};
