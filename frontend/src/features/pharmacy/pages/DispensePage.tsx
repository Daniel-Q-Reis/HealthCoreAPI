import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../api';
import { DrugInfoAssistant } from '../components/DrugInfoAssistant';
import { Save, AlertCircle, User } from 'lucide-react';
import { Medication, Patient } from '../types';

interface DispenseFormValues {
    medication_id: string;
    patient_id: string;
    quantity: number;
    notes: string;
}

export const DispensePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<DispenseFormValues>();

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

    // We need a way to fetch patients - using a placeholder for now
    const selectedMedication = medications?.find((m: Medication) => m.id.toString() === selectedMedId);

    const { mutate: dispense, isLoading, error } = useMutation({
        mutationFn: (data: DispenseFormValues) => pharmacyApi.createDispensation({
            medication_id: parseInt(data.medication_id),
            patient_id: parseInt(data.patient_id),
            practitioner_id: 1, // TODO: Get from Auth Context
            quantity: data.quantity,
            notes: data.notes
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medications'] });
            navigate('/dqr-health/pharmacy/inventory');
        }
    });

    const onSubmit = (data: DispenseFormValues) => {
        dispense(data);
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dispense Medication</h1>
                <p className="mt-1 text-sm text-gray-500">Record a new medication dispensation for a patient.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        {/* Patient Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient</label>
                            <div className="relative mt-1">
                                <select
                                    {...register('patient_id', { required: 'Patient is required' })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                >
                                    <option value="">Select a patient...</option>
                                    {patients?.map((patient: Patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.given_name} {patient.family_name} (MRN: {patient.mrn})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.patient_id && <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>}
                        </div>

                        {/* Medication Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Medication</label>
                            <select
                                {...register('medication_id', { required: 'Medication is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value="">Select a medication...</option>
                                {medications?.map((med: Medication) => (
                                    <option key={med.id} value={med.id}>
                                        {med.name} ({med.brand}) - Stock: {med.stock_quantity}
                                    </option>
                                ))}
                            </select>
                            {errors.medication_id && <p className="mt-1 text-sm text-red-600">{errors.medication_id.message}</p>}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                                type="number"
                                {...register('quantity', { required: 'Quantity is required', min: 1 })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                                        <div className="mt-2 text-sm text-red-700">{(error as Error).message}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
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

                {/* Sidebar / AI Assistant */}
                <div className="space-y-6">
                    <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                        <h3 className="font-medium text-gray-900">Patient Safety Checks</h3>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>Verify 5 Rights of Medication Administration</li>
                            <li>Check for Allergies</li>
                            <li>Review recent lab results</li>
                        </ul>
                    </div>

                    {selectedMedication && (
                        <DrugInfoAssistant
                            medicationName={selectedMedication.name}
                            patientContext="Standard adult patient" // In real app, fetch from selected patient
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
