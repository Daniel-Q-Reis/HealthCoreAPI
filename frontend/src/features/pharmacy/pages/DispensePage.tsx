import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DrugInfoAssistant } from '../components/DrugInfoAssistant';
import { Save, AlertCircle, User, Stethoscope, FileText, BrainCircuit, X } from 'lucide-react';
import { Medication, Patient, Practitioner } from '../types';
import { SearchableSelect } from '@/shared/components/ui/SearchableSelect';

interface DispenseFormValues {
    medication_id: string | number;
    patient_id: string | number;
    practitioner_id: string | number;
    quantity: number;
    notes: string;
}

export const DispensePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<DispenseFormValues>({
        defaultValues: {
            quantity: 1
        }
    });

    // Watch for AI context
    const selectedMedId = watch('medication_id');

    // Fetch Data
    const { data: medications } = useQuery<Medication[]>({
        queryKey: ['medications'],
        queryFn: pharmacyApi.getMedications,
    });

    const { data: patients } = useQuery<Patient[]>({
        queryKey: ['patients'],
        queryFn: pharmacyApi.getPatients,
    });

    const { data: practitioners } = useQuery<Practitioner[]>({
        queryKey: ['practitioners'],
        queryFn: pharmacyApi.getPractitioners,
        onSuccess: (data) => {
            if (user) {
                const myPractitioner = data.find(p => p.user_id === Number(user.id));
                if (myPractitioner) {
                    setValue('practitioner_id', myPractitioner.id);
                }
            }
        }
    });

    const selectedMedication = medications?.find((m: Medication) => m.id === Number(selectedMedId));

    const { mutate: dispense, isLoading, error } = useMutation({
        mutationFn: (data: DispenseFormValues) => pharmacyApi.createDispensation({
            medication_id: Number(data.medication_id),
            patient_id: Number(data.patient_id),
            practitioner_id: Number(data.practitioner_id),
            quantity: Number(data.quantity),
            notes: data.notes
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medications'] });
            navigate('/dqr-health/pharmacy/inventory');
        },
    });

    const onSubmit = (data: DispenseFormValues) => {
        dispense(data);
    };

    // Prepare Options for Selects
    const patientOptions = patients?.map(p => ({
        value: p.id,
        label: `${p.given_name} ${p.family_name}`,
        subtext: `Born: ${p.birth_date} • MRN: ${p.mrn}`
    })) || [];

    const practitionerOptions = practitioners?.map(p => ({
        value: p.id,
        label: `${p.given_name} ${p.family_name}, ${p.specialization}`,
        subtext: `Lic: ${p.license_number}`
    })) || [];

    const medicationOptions = medications?.map(m => ({
        value: m.id,
        label: m.name,
        subtext: `${m.brand} • Stock: ${m.stock_quantity} • Exp: ${m.expiry_date}`
    })) || [];

    const errorMessage = error
        ? ((error as any).response?.data?.detail || (error as Error).message)
        : null;

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Dispense Medication</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Record a new medication dispensation for a patient.</p>
                </div>
                {selectedMedication && (
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Ask AI Assistant
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white dark:bg-dark-surface p-6 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-800 transition-colors">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Patient Selection */}
                            <div className="col-span-2 md:col-span-1">
                                <Controller
                                    name="patient_id"
                                    control={control}
                                    rules={{ required: 'Patient is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Patient"
                                            options={patientOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Search by name..."
                                            error={errors.patient_id?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Practitioner Selection */}
                            <div className="col-span-2 md:col-span-1">
                                <Controller
                                    name="practitioner_id"
                                    control={control}
                                    rules={{ required: 'Practitioner is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Dispensing Practitioner"
                                            options={practitionerOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Search practitioner..."
                                            error={errors.practitioner_id?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Medication Selection */}
                            <div className="col-span-2">
                                <Controller
                                    name="medication_id"
                                    control={control}
                                    rules={{ required: 'Medication is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Medication"
                                            options={medicationOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Search medication..."
                                            error={errors.medication_id?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Quantity</label>
                                <input
                                    type="number"
                                    {...register('quantity', { required: 'Quantity is required', min: 1 })}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3"
                                />
                                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Clinical Notes</label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3"
                                placeholder="Add any relevant clinical notes..."
                            />
                        </div>

                        {/* Error Display */}
                        {errorMessage && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Submission Error</h3>
                                        <div className="mt-2 text-sm text-red-700 dark:text-red-400">{errorMessage}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 min-w-[150px]"
                            >
                                {isLoading ? 'Dispensing...' : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Confirm Dispensation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* AI Assistant Modal */}
            {isAIModalOpen && selectedMedication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl rounded-lg bg-white dark:bg-dark-surface shadow-2xl ring-1 ring-gray-200 dark:ring-zinc-800">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                <BrainCircuit className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                AI Drug Information Assistant
                            </h3>
                            <button
                                onClick={() => setIsAIModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto dark:text-zinc-200">
                            <DrugInfoAssistant
                                medicationName={selectedMedication.name}
                                patientContext="Standard adult patient" // TODO: Dynamically bind to selected patient info if possible
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
