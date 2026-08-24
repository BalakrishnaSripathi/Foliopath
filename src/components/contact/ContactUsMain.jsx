import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { ContactUsSchema } from './contactUsSchema';
import { contactUsApi } from '@/api/contactUsController'; 

// Custom Form Field with reserved error space so height never shifts
const FormField = ({ label, error, children, required = false }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {/* Reserves space beforehand: height is fixed so layout does not expand */}
    <div className="h-4 text-[11px] text-red-500 font-medium leading-none flex items-center">
      {error ? error : <span className="opacity-0">&nbsp;</span>}
    </div>
  </div>
);

const inputCls = (hasError) =>
  `h-10 w-full rounded-lg border text-sm transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A86B]/20 px-3.5
  ${hasError ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-400/20" :  "border-slate-200 bg-slate-50 focus:border-[#00A86B]"}`;

const selectCls = (hasError) =>
  `h-10 w-full rounded-lg border text-sm transition outline-none bg-slate-50 focus:ring-2 focus:ring-[#00A86B]/20 text-slate-700 px-3.5
  ${hasError ? "border-red-400 bg-red-50/20 focus:border-red-500" : "border-slate-200 focus:border-[#00A86B]"}`;

const ContactUsMain = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm({
    resolver: zodResolver(ContactUsSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      mobileNum: "",
      emailId: "",
      currentPosition: "",
      location: ""
    }
  });

  const [fname, mobileNum, email, currentPosition, location] = watch([
    "fullName",
    "mobileNum",
    "emailId",
    "currentPosition",
    "location"
  ]);

  useEffect(() => {
    setGlobalError(null);
  }, [fname, mobileNum, email, currentPosition, location]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      await contactUsApi.createContactUs({
        fullName: data.fullName,
        mobileNumber: data.mobileNum,
        email: data.emailId,
        currentPosition: data.currentPosition,
        location: data.location || "Not Provided"
      });

      toast.success("Submitted successfully! Our team will reach out shortly.", {
        className: '!bg-[#0B2545] !text-white'
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Contact request submission failure:", error);
      setGlobalError(error.response?.data?.message || "Internal system connection issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOpenDialogChange = (isOpen) => {
    setGlobalError(null);
    onOpenChange(isOpen);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenDialogChange}>
      {/* Fixed exact height h-[614px] and fixed width w-[448px] */}
      <DialogContent className="w-[448px] h-[614px] p-0 rounded-[14px] border-none overflow-hidden bg-white shadow-2xl transition-none">
        <VisuallyHidden>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>Fill in your details to contact us.</DialogDescription>
        </VisuallyHidden>

        <div className="w-full h-full flex flex-col justify-between">
          {/* Header */}
          <div className="bg-[#0B2545] text-white py-4 px-5 text-center space-y-1 shrink-0 relative overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1 bg-[#00A86B]" />
            <h2 className="text-xl font-bold tracking-wide text-white">Contact Us</h2>
            <p className="text-xs text-slate-300 font-normal max-w-[340px] mx-auto leading-relaxed">
              Fill in your details and our team will get back to you within 24 hours.
            </p>
          </div>

          {/* Global Error Banner Box */}
          {globalError && (
            <div className="mx-5 mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium shrink-0">
              {globalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-5 py-3 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="space-y-1">
              {/* Full Name */}
              <FormField label="Full Name" required error={errors.fullName?.message}>
                <Input 
                  {...register("fullName")} 
                  className={inputCls(!!errors.fullName)} 
                  placeholder="e.g. Priya Sharma" 
                />
              </FormField>

              {/* Mobile Number */}
              <FormField label="Mobile Number" required error={errors.mobileNum?.message}>
                <Input 
                  {...register("mobileNum")} 
                  className={inputCls(!!errors.mobileNum)} 
                  placeholder="e.g. +91 98765 43210" 
                />
              </FormField>

              {/* E-mail Address */}
              <FormField label="E-mail Address" required error={errors.emailId?.message}>
                <Input 
                  type="email"
                  {...register("emailId")} 
                  className={inputCls(!!errors.emailId)} 
                  placeholder="e.g. priya@example.com" 
                />
              </FormField>

              {/* Current Position */}
              <FormField label="Current Position" required error={errors.currentPosition?.message}>
                <Controller
                  name="currentPosition"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={selectCls(!!errors.currentPosition)}>
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="DEVELOPER">Developer</SelectItem>
                        <SelectItem value="WORKING_PROFESSIONAL">Working Professional</SelectItem>
                        <SelectItem value="FREELANCER">Freelancer</SelectItem>
                        <SelectItem value="DEVOPS_ENGINEER">DevOps Engineer</SelectItem>
                        <SelectItem value="TEST_ENGINEER">Test Engineer</SelectItem>
                        <SelectItem value="QA_ENGINEER">QA Engineer</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              {/* Location */}
              <FormField label="Location" error={errors.location?.message}>
                <Input 
                  {...register("location")} 
                  className={inputCls(!!errors.location)} 
                  placeholder="e.g. Mumbai, Maharashtra" 
                />
              </FormField>
            </div>

            {/* Action Footer */}
            <div className="pt-1 pb-2 space-y-1.5 shrink-0">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="h-10 w-full rounded-lg bg-[#00A86B] hover:bg-[#008f5a] text-sm font-semibold text-white shadow transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Contact Us
                  </>
                )}
              </Button>
              
              <p className="text-[11px] text-slate-400 text-center font-normal">
                Your information is kept private and never shared.
              </p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactUsMain;
