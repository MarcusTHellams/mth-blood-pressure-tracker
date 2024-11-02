'use client';

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from '@/components';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { InferType, number, object } from 'yup';
import axios from 'axios';
import { type Readings } from '@/db';
import { toast } from 'sonner';

const schema = object({
	systolic: number()
		.moreThan(0, 'Systolic must be greater than Zero')
		.transform((value) => {
			return isNaN(value) ? undefined : value;
		})
		.required('Systolic is Required'),
	diastolic: number()
		.moreThan(0, 'Diastolic must be greater than Zero')
		.transform((value) => {
			return isNaN(value) ? undefined : value;
		})
		.required('Diastolic is Required'),
});

type TrackerFormValues = InferType<typeof schema>;

export const AddBPReading = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const form = useForm<TrackerFormValues>({
		resolver: yupResolver(schema),
		defaultValues: {
			diastolic: 0,
			systolic: 0,
		},
	});
	const bpLoadingRef = useRef<ReturnType<typeof toast.loading>>();

	const { mutate, isPending } = useMutation<Readings, Error, TrackerFormValues>(
		{
			mutationKey: ['addBPReading'],
			async mutationFn(values) {
				return (await axios.post('/api/bp-readings', values)).data;
			},
			onMutate() {
				bpLoadingRef.current = toast.loading('Adding BP Reading...');
			},
			onSuccess() {
				toast.success('Added BP Reading');
				form.reset();
				setModalOpen(false);
			},
			onError(error) {
				toast.error(`Failed to add BP Reading: ${error.message}`);
			},
			onSettled() {
				if (bpLoadingRef.current) {
					toast.dismiss(bpLoadingRef.current);
				}
			},
		}
	);

	const submitHandler = form.handleSubmit((values) => {
		mutate(values);
	});
	return (
		<>
			<Button onClick={() => setModalOpen((prev) => !prev)} size="sm">
				ADD BP READING
			</Button>
			<Dialog
				open={modalOpen}
				onOpenChange={() => {
					setModalOpen(false);
					form.reset();
				}}
			>
				<DialogContent className="">
					<DialogHeader>
						<DialogTitle className="my-0">Add BP Reading</DialogTitle>
						<DialogDescription>
							Enter your Systolic/Diastolic Readings
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form noValidate onSubmit={submitHandler}>
							<div className="flex flex-col md:flex-row gap-2">
								<FormField
									control={form.control}
									name="systolic"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel className="font-bold" htmlFor="systolic">
												Systolic
											</FormLabel>
											<FormControl>
												<Input
													inputMode="numeric"
													min="0"
													type="number"
													id="systolic"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="diastolic"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel className="font-bold" htmlFor="diastolic">
												Diastolic
											</FormLabel>
											<FormControl>
												<Input
													inputMode="numeric"
													min="0"
													type="number"
													id="diastolic"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<Button
								disabled={isPending}
								variant="outline"
								className="w-full mt-4"
								type="submit"
							>
								Submit
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
};
