/**
 * Default initial dataset for "رابعة طب" (Fourth Year Medical Study Suite)
 * Includes all specified subjects, categories, and exact lecture titles.
 */

const DEFAULT_EXAM_DATE = '2027-02-19T09:00:00';

const DEFAULT_SUBJECTS = [
  {
    id: 'subj_pediatrics',
    name: 'Pediatrics',
    code: 'PED-401',
    icon: 'fa-baby',
    priority: 'High',
    rating: 5,
    color: '#D4A62F',
    categories: [
      {
        id: 'cat_ped_1',
        name: 'Neonatology',
        lectures: [
          { id: 'lec_ped_1', title: 'Respiratory Distress', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_2', title: 'Neonatal Sepsis & Congenital Infections', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_3', title: 'Apgar Score', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_4', title: 'Jaundice', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_2',
        name: 'Nutritional Disorders',
        lectures: [
          { id: 'lec_ped_5', title: 'Growth and Development', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_6', title: 'Protein Energy Malnutrition', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_7', title: 'Rickets', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_8', title: 'Infant Feeding', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_3',
        name: 'Respiratory',
        lectures: [
          { id: 'lec_ped_9', title: 'Pneumonia', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_10', title: 'Pleural Diseases', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_11', title: 'Upper Respiratory Diseases', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_4',
        name: 'Hematology',
        lectures: [
          { id: 'lec_ped_12', title: 'Coagulation Disorders', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_13', title: 'Platelet Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_14', title: 'Anemia & Hemolytic Anemia', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_5',
        name: 'Gastroenterology',
        lectures: [
          { id: 'lec_ped_15', title: 'Oral Cavity', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_16', title: 'Constipation & GI Bleeding', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_17', title: 'Acute & Chronic Diarrhea', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_18', title: 'Vomiting', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_6',
        name: 'Cardiology',
        lectures: [
          { id: 'lec_ped_19', title: 'Introduction to Pediatric Cardiology', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_20', title: 'Acyanotic Congenital Heart Disease', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_21', title: 'Congenital Cyanotic Heart Disease', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_22', title: 'Heart Failure & Obstructive Lesions', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_23', title: 'Rheumatic Heart Disease', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_24', title: 'Infective Endocarditis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_7',
        name: 'Nephrology',
        lectures: [
          { id: 'lec_ped_25', title: 'UTI and VUR', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_26', title: 'Hematuria & Glomerulonephritis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_27', title: 'Polycystic Kidney Disease', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_28', title: 'Proteinuria & Nephrotic Syndrome', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_8',
        name: 'Neurology',
        lectures: [
          { id: 'lec_ped_29', title: 'Seizures & Epilepsy', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_30', title: 'Cerebral Palsy & Neurodegenerative Disorders', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_31', title: 'CNS Anomalies', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_32', title: 'Neuromuscular Diseases', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_9',
        name: 'Endocrine & Adolescent Medicine',
        lectures: [
          { id: 'lec_ped_33', title: 'Endocrine Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_34', title: 'Adrenal Gland', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_35', title: 'Puberty & Its Abnormalities', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_36', title: 'Thyroid & Parathyroid Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_37', title: 'Diabetes Mellitus', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_10',
        name: 'Infections',
        lectures: [
          { id: 'lec_ped_38', title: 'Bacterial Meningitis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_39', title: 'Bacterial Infections', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_40', title: 'Viral Infections', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_11',
        name: 'Allergy',
        lectures: [
          { id: 'lec_ped_41', title: 'Bronchial Asthma', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_12',
        name: 'Rheumatology',
        lectures: [
          { id: 'lec_ped_42', title: 'Juvenile Idiopathic Arthritis (JIA)', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_43', title: 'Childhood SLE', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_44', title: 'Vasculitis and HSP', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ped_45', title: 'Kawasaki Disease', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_13',
        name: 'Immunology',
        lectures: [
          { id: 'lec_ped_46', title: 'Approach to Immunodeficiency', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_14',
        name: 'Oncology',
        lectures: [
          { id: 'lec_ped_47', title: 'Leukemia & Lymphoma', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_15',
        name: 'Genetics',
        lectures: [
          { id: 'lec_ped_48', title: 'Genetic Syndromes', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'cat_ped_16',
        name: 'Hepatology',
        lectures: [
          { id: 'lec_ped_49', title: 'Hepatology', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_anesthesia',
    name: 'Anesthesia',
    code: 'ANE-402',
    icon: 'fa-lungs',
    priority: 'Medium',
    rating: 4,
    color: '#3A7BD5',
    categories: [
      {
        id: 'cat_ane_1',
        name: 'Anesthesia Contents',
        lectures: [
          { id: 'lec_ane_1', title: 'Preoperative Care', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_2', title: 'General Anesthesia', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_3', title: 'Regional Anaesthesia', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_4', title: 'Intraoperative Anesthetic Risk', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_5', title: 'Basic Monitoring', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_6', title: 'Airway Management', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_7', title: 'Basic Life Support', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_8', title: 'Postoperative Pain Management', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_9', title: 'Postoperative Complications 1 & 2', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_10', title: 'Fluid Therapy', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_ane_11', title: 'Oxygen Therapy', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_psychiatry',
    name: 'Psychiatry',
    code: 'PSY-403',
    icon: 'fa-brain',
    priority: 'Medium',
    rating: 4,
    color: '#8E44AD',
    categories: [
      {
        id: 'cat_psy_1',
        name: 'Psychiatry Contents',
        lectures: [
          { id: 'lec_psy_1', title: 'Anxiety Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_2', title: 'Depressive, Bipolar, and Related Disorders', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_3', title: 'Schizophrenia and Other Psychotic Disorders', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_4', title: 'Somatic Symptom and Related Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_5', title: 'Eating Disorders', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_6', title: 'Adjustment Disorders', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_7', title: 'Substance Use Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_8', title: 'Suicide', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_9', title: 'Psychopharmacology', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_psy_10', title: 'Normal Sleep and Sleep Disorders', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_tropical',
    name: 'Tropical Medicine',
    code: 'TRP-404',
    icon: 'fa-virus',
    priority: 'High',
    rating: 5,
    color: '#16A085',
    categories: [
      {
        id: 'cat_trp_1',
        name: 'Tropical Medicine Contents',
        lectures: [
          { id: 'lec_trp_1', title: 'Approach to Fever', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_2', title: 'Travel Medicine & Immunization', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_3', title: 'Nosocomial Infection', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_4', title: 'Heat Disorders', rating: 0, difficulty: 'Easy', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_5', title: 'Tropical Infections', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_6', title: 'H. pylori', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_7', title: 'Salmonellosis & Brucellosis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_8', title: 'HIV & Opportunistic Infections', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_9', title: 'CMV, Tetanus & Rabies', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_10', title: 'Gastrointestinal Infections', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_11', title: 'Abdominal Tuberculosis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_12', title: 'Fever of Unknown Origin', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_13', title: 'Emerging Infections (COVID-19)', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_14', title: 'Acute Viral Hepatitis', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_15', title: 'Chronic HBV & HCV', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_16', title: 'Portal Hypertension', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_trp_17', title: 'Acute Liver Failure', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_rheumatology',
    name: 'Rheumatology',
    code: 'RHE-405',
    icon: 'fa-bone',
    priority: 'Medium',
    rating: 4,
    color: '#E67E22',
    categories: [
      {
        id: 'cat_rhe_1',
        name: 'Rheumatology Contents',
        lectures: [
          { id: 'lec_rhe_1', title: 'Rheumatoid Arthritis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_rhe_2', title: 'SLE', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_rhe_3', title: 'Spondyloarthropathies', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_rhe_4', title: 'Systemic Sclerosis', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_rhe_5', title: 'Crystal-Induced Arthritis', rating: 0, difficulty: 'Medium', status: 'Not Started', completed: false, completedAt: null, notes: '' },
          { id: 'lec_rhe_6', title: 'Inflammatory Myopathies', rating: 0, difficulty: 'Hard', status: 'Not Started', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  }
];

const DEFAULT_SETTINGS = {
  examDate: DEFAULT_EXAM_DATE,
  theme: 'navy-gold-classic',
  defaultCalendarView: 'month',
  firstDayOfWeek: 6, // 6 = Saturday (standard academic in Egypt/Middle East) or 0 = Sunday
  autoCompleteLectureWithTask: false,
  defaultTaskPriority: 'Medium',
  notificationsEnabled: false
};

// Export to window/global
window.DEFAULT_EXAM_DATE = DEFAULT_EXAM_DATE;
window.DEFAULT_SUBJECTS = DEFAULT_SUBJECTS;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
