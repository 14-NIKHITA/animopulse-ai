import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, uploadFileToSupabase } from '../lib/supabase';
import { extractTextFromFile, chunkTextByCharacter } from '../lib/rag';
import { initialRescueServices } from '../data/seedData';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

/**
 * Calculates vaccination status dynamically based on current date & Section 4.7 rules:
 * - Overdue: next_due_date < today
 * - Due Soon: next_due_date within 30 days
 * - Upcoming: next_due_date > 30 days away
 * - Completed: manually marked completed
 */
export function calculateVaccineStatus(nextDueDate, isCompleted = false) {
  if (isCompleted) return 'Completed';
  if (!nextDueDate) return 'Upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(nextDueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 30) return 'Due Soon';
  return 'Upcoming';
}

export const AppProvider = ({ children }) => {
  const { user } = useAuth();

  // 1. Real Supabase Pets State
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsError, setPetsError] = useState(null);

  // Active Pet ID (Only stored in localStorage as ID string)
  const [activePetId, setActivePetIdState] = useState(() => {
    return localStorage.getItem('animopulse_active_pet_id') || null;
  });

  const setActivePetId = (id) => {
    setActivePetIdState(id);
    if (id) {
      localStorage.setItem('animopulse_active_pet_id', id);
    } else {
      localStorage.removeItem('animopulse_active_pet_id');
    }
  };

  // 2. Real Supabase Vaccinations State
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccinationsLoading, setVaccinationsLoading] = useState(true);
  const [vaccinationsError, setVaccinationsError] = useState(null);

  // 3. Real Supabase Medical Records State
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(true);
  const [medicalRecordsError, setMedicalRecordsError] = useState(null);

  // 4. Real Supabase Emergency Sessions State
  const [emergencySessions, setEmergencySessions] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(true);

  // 5. Real Supabase AI Conversations State
  const [aiConversations, setAiConversations] = useState([]);

  // Other modules
  const [rescueServices] = useState(initialRescueServices);
  const [toasts, setToasts] = useState([]);

  // Fetch real pets from Supabase whenever user changes
  useEffect(() => {
    const fetchPetsFromSupabase = async () => {
      if (!user) {
        setPets([]);
        setActivePetIdState(null);
        localStorage.removeItem('animopulse_active_pet_id');
        setPetsLoading(false);
        return;
      }

      setPetsLoading(true);
      setPetsError(null);

      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const loadedPets = data || [];
        setPets(loadedPets);

        // Verify activePetId belongs to current user
        const storedActiveId = localStorage.getItem('animopulse_active_pet_id');
        const belongsToUser = loadedPets.some(p => String(p.id) === String(storedActiveId));

        if (storedActiveId && belongsToUser) {
          setActivePetIdState(storedActiveId);
        } else if (loadedPets.length > 0) {
          setActivePetIdState(loadedPets[0].id);
          localStorage.setItem('animopulse_active_pet_id', loadedPets[0].id);
        } else {
          setActivePetIdState(null);
          localStorage.removeItem('animopulse_active_pet_id');
        }
      } catch (err) {
        console.error('[Supabase Fetch Pets Error]', err);
        setPetsError(err.message || 'Failed to load pet profiles');
      } finally {
        setPetsLoading(false);
      }
    };

    fetchPetsFromSupabase();
  }, [user]);

  // Fetch real vaccinations from Supabase whenever user changes
  useEffect(() => {
    const fetchVaccinationsFromSupabase = async () => {
      if (!user) {
        setVaccinations([]);
        setVaccinationsLoading(false);
        return;
      }

      setVaccinationsLoading(true);
      setVaccinationsError(null);

      try {
        const { data, error } = await supabase
          .from('vaccinations')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const realVacList = (data || []).map(v => ({
          ...v,
          status: calculateVaccineStatus(v.next_due_date, Boolean(v.completed_at || v.status === 'Completed'))
        }));

        realVacList.sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());

        setVaccinations(realVacList);
      } catch (err) {
        console.error('[Supabase Fetch Vaccinations Error]', err);
        setVaccinationsError(err.message || 'Failed to load vaccination records');
      } finally {
        setVaccinationsLoading(false);
      }
    };

    fetchVaccinationsFromSupabase();
  }, [user]);

  // Fetch real medical records from Supabase whenever user changes
  useEffect(() => {
    const fetchMedicalRecordsFromSupabase = async () => {
      if (!user) {
        setMedicalRecords([]);
        setMedicalRecordsLoading(false);
        return;
      }

      setMedicalRecordsLoading(true);
      setMedicalRecordsError(null);

      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setMedicalRecords(data || []);
      } catch (err) {
        console.error('[Supabase Fetch Medical Records Error]', err);
        setMedicalRecordsError(err.message || 'Failed to load medical records');
      } finally {
        setMedicalRecordsLoading(false);
      }
    };

    fetchMedicalRecordsFromSupabase();
  }, [user]);

  // Fetch real emergency sessions from Supabase whenever user changes
  useEffect(() => {
    const fetchEmergencySessionsFromSupabase = async () => {
      if (!user) {
        setEmergencySessions([]);
        setEmergencyLoading(false);
        return;
      }

      setEmergencyLoading(true);

      try {
        const { data, error } = await supabase
          .from('emergency_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setEmergencySessions(data || []);
      } catch (err) {
        console.error('[Supabase Fetch Emergency Sessions Error]', err);
      } finally {
        setEmergencyLoading(false);
      }
    };

    fetchEmergencySessionsFromSupabase();
  }, [user]);

  // Fetch real AI conversations from Supabase whenever user changes
  useEffect(() => {
    const fetchAiConversationsFromSupabase = async () => {
      if (!user) {
        setAiConversations([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error && error.code !== 'PGRST116') {
          console.error('[Supabase Fetch AI Conversations Error]', error);
        }

        setAiConversations(data || []);
      } catch (err) {
        console.error('[Fetch AI Conversations Error]', err);
      }
    };

    fetchAiConversationsFromSupabase();
  }, [user]);

  // Derived Active Pet object
  const activePet = pets.find(p => String(p.id) === String(activePetId)) || pets[0] || null;

  // Toast System
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ==========================================
  // REAL SUPABASE PETS CRUD OPERATIONS
  // ==========================================

  const addPet = async (petData) => {
    if (!user) throw new Error('Authentication required');
    setPetsLoading(true);

    const newPetRecord = {
      user_id: user.id,
      name: petData.name.trim(),
      animal_type: petData.animal_type || 'Dog',
      breed: petData.breed || 'Mixed Breed',
      date_of_birth: petData.date_of_birth || null,
      gender: petData.gender || 'Male',
      weight: petData.weight ? parseFloat(petData.weight) : null,
      colour: petData.colour || '',
      allergies: petData.allergies || 'None',
      medications: petData.medications || 'None',
      medical_conditions: petData.medical_conditions || 'None',
      microchip_number: petData.microchip_number || '',
      notes: petData.notes || '',
      image_url: petData.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([newPetRecord])
        .select()
        .single();

      if (error) throw error;

      setPets(prev => [data, ...prev]);
      setActivePetId(data.id);
      addToast(`Pet profile "${data.name}" created!`, 'success');
      setPetsLoading(false);
      return data;
    } catch (err) {
      console.error('[Supabase Add Pet Error]', err);
      addToast(`Failed to save pet profile: ${err.message}`, 'danger');
      setPetsLoading(false);
      throw err;
    }
  };

  const updatePet = async (petId, updatedFields) => {
    if (!user) throw new Error('Authentication required');

    try {
      const payload = {
        ...updatedFields,
        updated_at: new Date().toISOString()
      };
      delete payload.user_id;

      const { data, error } = await supabase
        .from('pets')
        .update(payload)
        .eq('id', petId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPets(prev => prev.map(p => String(p.id) === String(petId) ? data : p));
      addToast(`Pet profile updated successfully.`, 'success');
      return data;
    } catch (err) {
      console.error('[Supabase Update Pet Error]', err);
      addToast(`Failed to update pet: ${err.message}`, 'danger');
      throw err;
    }
  };

  const deletePet = async (petId) => {
    if (!user) throw new Error('Authentication required');

    try {
      const petToDelete = pets.find(p => String(p.id) === String(petId));

      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('user_id', user.id);

      if (error) throw error;

      const remaining = pets.filter(p => String(p.id) !== String(petId));
      setPets(remaining);
      setVaccinations(prev => prev.filter(v => String(v.pet_id) !== String(petId)));
      setMedicalRecords(prev => prev.filter(m => String(m.pet_id) !== String(petId)));

      if (String(activePetId) === String(petId)) {
        const nextActiveId = remaining[0]?.id || null;
        setActivePetId(nextActiveId);
      }

      addToast(`Pet "${petToDelete?.name || 'Profile'}" deleted.`, 'info');
    } catch (err) {
      console.error('[Supabase Delete Pet Error]', err);
      addToast(`Failed to delete pet: ${err.message}`, 'danger');
      throw err;
    }
  };

  // ==========================================
  // REAL SUPABASE VACCINATIONS CRUD OPERATIONS
  // ==========================================

  const addVaccination = async (vacData) => {
    if (!user) throw new Error('Authentication required');

    const targetPetId = vacData.pet_id || activePetId;
    if (!targetPetId) {
      addToast('Please select a valid pet profile first.', 'danger');
      throw new Error('Pet required for vaccination');
    }

    setVaccinationsLoading(true);

    const calculatedStatus = calculateVaccineStatus(vacData.next_due_date, false);

    const newVacPayload = {
      user_id: user.id,
      pet_id: targetPetId,
      vaccine_name: vacData.vaccine_name.trim(),
      last_vaccination_date: vacData.last_vaccination_date || null,
      next_due_date: vacData.next_due_date,
      veterinarian_name: vacData.veterinarian_name || '',
      hospital_name: vacData.hospital_name || '',
      status: calculatedStatus,
      notes: vacData.notes || '',
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .insert([newVacPayload])
        .select()
        .single();

      if (error) throw error;

      const formattedData = {
        ...data,
        status: calculateVaccineStatus(data.next_due_date, false)
      };

      setVaccinations(prev => {
        const updated = [formattedData, ...prev];
        updated.sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
        return updated;
      });

      addToast(`Vaccination "${formattedData.vaccine_name}" logged!`, 'success');
      setVaccinationsLoading(false);
      return formattedData;
    } catch (err) {
      console.error('[Supabase Add Vaccination Error]', err);
      addToast(`Failed to log vaccination: ${err.message}`, 'danger');
      setVaccinationsLoading(false);
      throw err;
    }
  };

  const updateVaccination = async (vacId, updatedFields) => {
    if (!user) throw new Error('Authentication required');

    try {
      const newStatus = calculateVaccineStatus(
        updatedFields.next_due_date, 
        Boolean(updatedFields.completed_at || updatedFields.status === 'Completed')
      );

      const payload = {
        ...updatedFields,
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      delete payload.user_id;

      const { data, error } = await supabase
        .from('vaccinations')
        .update(payload)
        .eq('id', vacId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const formattedData = {
        ...data,
        status: newStatus
      };

      setVaccinations(prev => {
        const updated = prev.map(v => String(v.id) === String(vacId) ? formattedData : v);
        updated.sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
        return updated;
      });

      addToast('Vaccination record updated.', 'success');
      return formattedData;
    } catch (err) {
      console.error('[Supabase Update Vaccination Error]', err);
      addToast(`Failed to update vaccination: ${err.message}`, 'danger');
      throw err;
    }
  };

  const toggleVaccineCompleted = async (vacId) => {
    if (!user) throw new Error('Authentication required');

    const vacToUpdate = vaccinations.find(v => String(v.id) === String(vacId));
    if (!vacToUpdate) return;

    const isNowCompleted = vacToUpdate.status !== 'Completed' && !vacToUpdate.completed_at;
    const newCompletedAt = isNowCompleted ? new Date().toISOString() : null;
    const newStatus = isNowCompleted ? 'Completed' : calculateVaccineStatus(vacToUpdate.next_due_date, false);

    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .update({
          completed_at: newCompletedAt,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', vacId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const formattedData = {
        ...data,
        status: newStatus
      };

      setVaccinations(prev => prev.map(v => String(v.id) === String(vacId) ? formattedData : v));
      addToast(isNowCompleted ? 'Vaccination marked as Completed! 🎉' : 'Vaccination marked as Pending.', 'info');
    } catch (err) {
      console.error('[Supabase Toggle Vaccination Error]', err);
      addToast(`Failed to update status: ${err.message}`, 'danger');
    }
  };

  const deleteVaccination = async (vacId) => {
    if (!user) throw new Error('Authentication required');

    try {
      const vacToDelete = vaccinations.find(v => String(v.id) === String(vacId));

      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', vacId)
        .eq('user_id', user.id);

      if (error) throw error;

      setVaccinations(prev => prev.filter(v => String(v.id) !== String(vacId)));
      addToast(`Vaccination "${vacToDelete?.vaccine_name || 'Record'}" deleted.`, 'info');
    } catch (err) {
      console.error('[Supabase Delete Vaccination Error]', err);
      addToast(`Failed to delete vaccination: ${err.message}`, 'danger');
      throw err;
    }
  };

  // ==========================================
  // REAL SUPABASE MEDICAL RECORDS & RAG PIPELINE
  // ==========================================

  const addMedicalRecord = async (recordData, file) => {
    if (!user) throw new Error('Authentication required');

    const targetPetId = recordData.pet_id || activePetId;
    if (!targetPetId) {
      addToast('Please select a valid pet profile first.', 'danger');
      throw new Error('Pet required for medical record');
    }

    setMedicalRecordsLoading(true);

    let fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    let filePath = `uploads/${Date.now()}_report.pdf`;
    let fileType = 'pdf';

    if (file) {
      fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${user.id}/${targetPetId}/${cleanFileName}`;

      const { publicUrl, filePath: uploadedPath } = await uploadFileToSupabase('medical-records', storagePath, file);
      if (publicUrl) fileUrl = publicUrl;
      if (uploadedPath) filePath = uploadedPath;
    }

    const initialPayload = {
      user_id: user.id,
      pet_id: targetPetId,
      title: recordData.title.trim(),
      category: recordData.category || 'General checkup',
      file_url: fileUrl,
      file_path: filePath,
      file_type: fileType,
      veterinarian_name: recordData.veterinarian_name || '',
      hospital_name: recordData.hospital_name || '',
      record_date: recordData.record_date || new Date().toISOString().split('T')[0],
      notes: recordData.notes || '',
      extracted_text: 'Text extraction in progress...',
      ai_summary: `Document "${recordData.title}" (${recordData.category}) uploaded. Extracting text for RAG chunking...`,
      processing_status: 'Extracting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data: insertedRecord, error: insertError } = await supabase
        .from('medical_records')
        .insert([initialPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      setMedicalRecords(prev => [insertedRecord, ...prev]);

      const extractedText = await extractTextFromFile(
        file || { name: `${recordData.title}.pdf` }, 
        recordData.category, 
        recordData.title
      );

      const chunks = chunkTextByCharacter(extractedText, 600, 100);

      if (chunks.length > 0) {
        const chunkRows = chunks.map(c => ({
          user_id: user.id,
          pet_id: targetPetId,
          medical_record_id: insertedRecord.id,
          chunk_index: c.chunk_index,
          chunk_text: c.chunk_text,
          embedding: null,
          metadata: c.metadata,
          created_at: new Date().toISOString()
        }));

        const { error: chunkError } = await supabase
          .from('document_chunks')
          .insert(chunkRows);

        if (chunkError) {
          console.error('[Supabase Document Chunks Insert Error]', chunkError);
        }
      }

      const finalSummary = `Document "${recordData.title}" (${recordData.category}) processed into ${chunks.length} chunk(s) (${extractedText.length} chars). Ready for Embeddings.`;
      
      const { data: updatedRecord, error: updateError } = await supabase
        .from('medical_records')
        .update({
          extracted_text: extractedText,
          ai_summary: finalSummary,
          processing_status: 'Ready for Embeddings',
          updated_at: new Date().toISOString()
        })
        .eq('id', insertedRecord.id)
        .select()
        .single();

      if (updateError) console.error('[Supabase Record RAG Status Update Error]', updateError);

      const activeRecord = updatedRecord || {
        ...insertedRecord,
        extracted_text: extractedText,
        ai_summary: finalSummary,
        processing_status: 'Ready for Embeddings'
      };

      setMedicalRecords(prev => prev.map(m => m.id === insertedRecord.id ? activeRecord : m));
      addToast(`Medical report "${activeRecord.title}" chunked (${chunks.length} chunks) & ready for embeddings!`, 'success');
      setMedicalRecordsLoading(false);
      return activeRecord;
    } catch (err) {
      console.error('[Supabase RAG Add Medical Record Error]', err);
      addToast(`Failed to process medical record: ${err.message}`, 'danger');
      setMedicalRecordsLoading(false);
      throw err;
    }
  };

  const deleteMedicalRecord = async (recordId) => {
    if (!user) throw new Error('Authentication required');

    try {
      const recordToDelete = medicalRecords.find(m => String(m.id) === String(recordId));

      await supabase
        .from('document_chunks')
        .delete()
        .eq('medical_record_id', recordId)
        .eq('user_id', user.id);

      if (recordToDelete?.file_path) {
        await supabase.storage.from('medical-records').remove([recordToDelete.file_path]);
      }

      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMedicalRecords(prev => prev.filter(m => String(m.id) !== String(recordId)));
      addToast(`Medical record "${recordToDelete?.title || 'Report'}" & associated chunks deleted.`, 'info');
    } catch (err) {
      console.error('[Supabase Delete Medical Record Error]', err);
      addToast(`Failed to delete record: ${err.message}`, 'danger');
      throw err;
    }
  };

  // ==========================================
  // REAL SUPABASE EMERGENCY SESSIONS LOGGING
  // ==========================================

  const addEmergencySession = async (sessionData) => {
    if (!user) throw new Error('Authentication required');

    const payload = {
      user_id: user.id,
      pet_id: activePet?.id || null,
      animal_type: sessionData.animalType || 'Animal',
      emergency_type: sessionData.emergencyType,
      user_description: sessionData.userDescription || '',
      triage_answers: sessionData.triageAnswers || {},
      urgency_level: sessionData.urgencyLevel,
      ai_guidance: sessionData.aiGuidance || {},
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('emergency_sessions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setEmergencySessions(prev => [data, ...prev]);
      addToast(`Emergency triage session logged (${data.urgency_level} urgency).`, 'warning');
      return data;
    } catch (err) {
      console.error('[Supabase Add Emergency Session Error]', err);
      addToast(`Failed to log emergency session: ${err.message}`, 'danger');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      pets,
      petsLoading,
      petsError,
      activePetId,
      setActivePetId,
      activePet,
      addPet,
      updatePet,
      deletePet,
      vaccinations,
      vaccinationsLoading,
      vaccinationsError,
      addVaccination,
      updateVaccination,
      toggleVaccineCompleted,
      deleteVaccination,
      medicalRecords,
      medicalRecordsLoading,
      medicalRecordsError,
      addMedicalRecord,
      deleteMedicalRecord,
      emergencySessions,
      emergencyLoading,
      addEmergencySession,
      aiConversations,
      rescueServices,
      toasts,
      addToast,
      removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};
