import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useComplaints } from '../../../context/ComplaintContext';
import { TopHeader } from '../../../components/layout/TopHeader';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { PriorityBadge } from '../../../components/complaints/PriorityBadge';
import { DuplicateWarningModal } from '../../../components/complaints/DuplicateWarningModal';
import { THEME, CAMPUS_BUILDINGS, CAMPUS_FLOORS } from '../../../constants/theme';
import { COMPLAINT_CATEGORIES, CATEGORY_LIST } from '../../../constants/categories';
import { COMPLAINT_PRIORITIES, PRIORITY_LIST } from '../../../constants/priority';
import { ComplaintCategory, ComplaintPriority, EvidenceItem } from '../../../types/complaint';
import { findPotentialDuplicates, DuplicateMatch } from '../../../utils/similarity';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: 'document-text-outline' },
  { id: 2, label: 'Location', icon: 'location-outline' },
  { id: 3, label: 'Evidence', icon: 'camera-outline' },
  { id: 4, label: 'Review & Submit', icon: 'checkmark-circle-outline' },
];

export default function CreateComplaintScreen() {
  const { complaints, createComplaint, followComplaint } = useComplaints();
  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  // Current wizard step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('INFRASTRUCTURE');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');

  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [floor, setFloor] = useState(CAMPUS_FLOORS[0]);
  const [roomArea, setRoomArea] = useState('');

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Validation & UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate warning states
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Issue title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }
    if (!description.trim()) {
      errs.description = 'Please describe the issue in detail.';
    } else if (description.trim().length < 15) {
      errs.description = 'Description must be at least 15 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!roomArea.trim()) {
      errs.roomArea = 'Please specify the exact room number or area (e.g. Lab 204).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        // Run duplicate detection check before advancing to evidence/review
        checkForDuplicates();
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const checkForDuplicates = () => {
    const matches = findPotentialDuplicates(
      {
        title,
        description,
        category,
        location: { building, floor, roomArea },
      },
      complaints
    );

    if (matches.length > 0) {
      setDuplicateMatches(matches);
      setShowDuplicateModal(true);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newEvidence: EvidenceItem = {
          id: `ev-${Date.now()}`,
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `evidence-${Date.now()}.jpg`,
        };
        setEvidenceList((prev) => [...prev, newEvidence]);
      }
    } catch (e) {
      console.warn('Image picker error', e);
      // Fallback demo evidence
      const demoEvidence: EvidenceItem = {
        id: `ev-${Date.now()}`,
        uri: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
        type: 'image',
        name: 'campus-issue.jpg',
      };
      setEvidenceList((prev) => [...prev, demoEvidence]);
    }
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    // Final check for duplicates if not already checked
    const matches = findPotentialDuplicates(
      {
        title,
        description,
        category,
        location: { building, floor, roomArea },
      },
      complaints
    );

    if (matches.length > 0 && !showDuplicateModal && duplicateMatches.length === 0) {
      setDuplicateMatches(matches);
      setShowDuplicateModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: {
          building,
          floor,
          roomArea: roomArea.trim(),
        },
        evidence: evidenceList,
        isAnonymous,
      });

      router.replace(`/complaints/${created.id}` as any);
    } catch (e: any) {
      Alert.alert('Submission Error', e.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowExisting = async (complaintId: string) => {
    setShowDuplicateModal(false);
    await followComplaint(complaintId);
    router.replace(`/complaints/${complaintId}` as any);
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Report Campus Issue"
        subtitle={`Step ${currentStep} of 4: ${STEPS[currentStep - 1].label}`}
        showBack
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Step Progress Bar */}
          <View style={styles.stepBar}>
            {STEPS.map((step) => {
              const isPassed = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isPassed && styles.stepCirclePassed,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    {isPassed ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={step.icon as any}
                        size={14}
                        color={isCurrent ? '#FFFFFF' : THEME.colors.textMuted}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelCurrent,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <View style={styles.stepBody}>
              <Text style={styles.sectionHeading}>Basic Information</Text>
              <Text style={styles.sectionSub}>Describe the problem you are experiencing</Text>

              <Input
                label="Issue Title"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Broken water cooler faucet"
                error={errors.title}
                required
              />

              <Input
                label="Detailed Description"
                value={description}
                onChangeText={(d) => {
                  setDescription(d);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Explain the location specifics, severity, how long it's been happening, etc."
                multiline
                numberOfLines={4}
                error={errors.description}
                required
              />

              {/* Category Selector */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Category <Text style={{ color: THEME.colors.danger }}>*</Text></Text>
                <View style={styles.categoryGrid}>
                  {CATEGORY_LIST.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={[
                          styles.catOption,
                          isSelected && { borderColor: cat.color, backgroundColor: cat.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={18}
                          color={isSelected ? cat.color : THEME.colors.textMuted}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.catOptionText,
                            isSelected && { color: cat.color, fontWeight: THEME.typography.weight.bold },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Priority Selector */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Priority Level <Text style={{ color: THEME.colors.danger }}>*</Text></Text>
                <View style={styles.priorityGrid}>
                  {PRIORITY_LIST.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setPriority(p.id)}
                        style={[
                          styles.priorityOption,
                          isSelected && { borderColor: p.color, backgroundColor: p.bgColor },
                        ]}
                      >
                        <View style={styles.priorityTopRow}>
                          <Text
                            style={[
                              styles.priorityTitle,
                              isSelected && { color: p.badgeTextColor, fontWeight: THEME.typography.weight.bold },
                            ]}
                          >
                            {p.label}
                          </Text>
                          <Text style={[styles.prioritySla, { color: p.color }]}>
                            {p.slaHours}h SLA
                          </Text>
                        </View>
                        <Text style={styles.priorityDesc} numberOfLines={2}>
                          {p.description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* STEP 2: Location Information */}
          {currentStep === 2 && (
            <View style={styles.stepBody}>
              <Text style={styles.sectionHeading}>Campus Location</Text>
              <Text style={styles.sectionSub}>Pinpoint where technicians should go</Text>

              {/* Building Selection */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Building / Complex <Text style={{ color: THEME.colors.danger }}>*</Text></Text>
                <View style={styles.buildingGrid}>
                  {CAMPUS_BUILDINGS.map((b) => {
                    const isSelected = building === b;
                    return (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setBuilding(b)}
                        style={[
                          styles.buildingOption,
                          isSelected && styles.buildingOptionActive,
                        ]}
                      >
                        <Ionicons
                          name="business-outline"
                          size={16}
                          color={isSelected ? THEME.colors.primary : THEME.colors.textMuted}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.buildingOptionText,
                            isSelected && styles.buildingOptionTextActive,
                          ]}
                        >
                          {b}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Floor Selection */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Floor <Text style={{ color: THEME.colors.danger }}>*</Text></Text>
                <View style={styles.floorRow}>
                  {CAMPUS_FLOORS.map((f) => {
                    const isSelected = floor === f;
                    return (
                      <TouchableOpacity
                        key={f}
                        onPress={() => setFloor(f)}
                        style={[
                          styles.floorChip,
                          isSelected && styles.floorChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.floorChipText,
                            isSelected && styles.floorChipTextActive,
                          ]}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Room Area Input */}
              <Input
                label="Room / Specific Area"
                value={roomArea}
                onChangeText={(r) => {
                  setRoomArea(r);
                  if (errors.roomArea) setErrors((prev) => ({ ...prev, roomArea: '' }));
                }}
                placeholder="e.g. Room 204, Chemistry Lab 3, West Corridor near stairs"
                helperText="Provide door number, lab name, or landmark for quick identification"
                error={errors.roomArea}
                required
              />
            </View>
          )}

          {/* STEP 3: Evidence & Attachments */}
          {currentStep === 3 && (
            <View style={styles.stepBody}>
              <Text style={styles.sectionHeading}>Upload Evidence</Text>
              <Text style={styles.sectionSub}>Attach photos to help staff diagnose and resolve faster</Text>

              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.uploadDropzone}
                activeOpacity={0.8}
              >
                <View style={styles.uploadCircle}>
                  <Ionicons name="cloud-upload-outline" size={32} color={THEME.colors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Tap to take or choose photo</Text>
                <Text style={styles.uploadSub}>Supports JPG, PNG (Max 10MB)</Text>
              </TouchableOpacity>

              {/* Attached Evidence Previews */}
              {evidenceList.length > 0 && (
                <View style={styles.evidenceGallery}>
                  <Text style={styles.evidenceTitle}>Attached Evidence ({evidenceList.length})</Text>
                  <View style={styles.evidenceRow}>
                    {evidenceList.map((ev) => (
                      <View key={ev.id} style={styles.evidenceThumbWrap}>
                        <Image source={{ uri: ev.uri }} style={styles.evidenceThumb} />
                        <TouchableOpacity
                          onPress={() => handleRemoveEvidence(ev.id)}
                          style={styles.removeEvidenceBtn}
                        >
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Anonymous Toggle */}
              <View style={styles.anonymousCard}>
                <View style={styles.anonymousTextCol}>
                  <Text style={styles.anonymousTitle}>Report Anonymously</Text>
                  <Text style={styles.anonymousDesc}>
                    Your name and email will not be visible to staff, faculty, or other students.
                  </Text>
                </View>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: THEME.colors.border, true: THEME.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          )}

          {/* STEP 4: Review & Confirm */}
          {currentStep === 4 && (
            <View style={styles.stepBody}>
              <Text style={styles.sectionHeading}>Review Complaint Details</Text>
              <Text style={styles.sectionSub}>Verify all information before submitting to campus operations</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Title:</Text>
                  <Text style={styles.reviewVal}>{title}</Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Description:</Text>
                  <Text style={styles.reviewVal}>{description}</Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Category:</Text>
                  <Text style={styles.reviewVal}>
                    {COMPLAINT_CATEGORIES[category]?.label || category}
                  </Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Priority:</Text>
                  <PriorityBadge priority={priority} showHours size="sm" />
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Location:</Text>
                  <Text style={styles.reviewVal}>
                    {building} • {floor} ({roomArea})
                  </Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Evidence:</Text>
                  <Text style={styles.reviewVal}>
                    {evidenceList.length > 0 ? `${evidenceList.length} photo(s) attached` : 'None attached'}
                  </Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Privacy:</Text>
                  <Text style={styles.reviewVal}>
                    {isAnonymous ? 'Anonymous submission' : 'Standard (Profile visible)'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Navigation / Actions Footer */}
          <View style={styles.wizardFooter}>
            {currentStep > 1 && (
              <Button
                title="Back"
                variant="secondary"
                onPress={handleBack}
                style={styles.wizardBtn}
              />
            )}

            {currentStep < 4 ? (
              <Button
                title="Continue"
                variant="primary"
                onPress={handleNext}
                style={styles.wizardBtn}
              />
            ) : (
              <Button
                title="Submit Complaint"
                variant="primary"
                loading={isSubmitting}
                onPress={handleSubmit}
                style={styles.wizardBtn}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        visible={showDuplicateModal}
        matches={duplicateMatches}
        onProceedAnyway={() => {
          setShowDuplicateModal(false);
          // If on step 4, proceed with submission
          if (currentStep === 4) {
            handleSubmit();
          }
        }}
        onFollowExisting={handleFollowExisting}
        onClose={() => setShowDuplicateModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xxl,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    ...THEME.shadows.sm,
  },
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingBottom: THEME.spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCirclePassed: {
    backgroundColor: THEME.colors.accent,
    borderColor: THEME.colors.accent,
  },
  stepCircleCurrent: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  stepLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  stepLabelCurrent: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  stepBody: {
    minHeight: 280,
  },
  sectionHeading: {
    fontSize: THEME.typography.size.lg,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  sectionSub: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.lg,
    marginTop: 2,
  },
  fieldSection: {
    marginBottom: THEME.spacing.lg,
  },
  fieldLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.medium,
    color: THEME.colors.text,
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  catOptionText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    minWidth: 140,
    padding: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  priorityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  prioritySla: {
    fontSize: 10,
    fontWeight: THEME.typography.weight.bold,
  },
  priorityDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 14,
  },
  buildingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  buildingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  buildingOptionActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  buildingOptionText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
  },
  buildingOptionTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  floorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  floorChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  floorChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  floorChipText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  floorChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  uploadDropzone: {
    borderWidth: 2,
    borderColor: THEME.colors.border,
    borderStyle: 'dashed',
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    marginBottom: THEME.spacing.lg,
  },
  uploadCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  uploadSub: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  evidenceGallery: {
    marginBottom: THEME.spacing.lg,
  },
  evidenceTitle: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.textMuted,
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  evidenceThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  evidenceThumb: {
    width: '100%',
    height: '100%',
  },
  removeEvidenceBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonymousCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  anonymousTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  anonymousTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  anonymousDesc: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    gap: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reviewKey: {
    width: 100,
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.textMuted,
  },
  reviewVal: {
    flex: 1,
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.text,
    lineHeight: 20,
  },
  wizardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.lg,
    marginTop: THEME.spacing.xl,
  },
  wizardBtn: {
    minWidth: 120,
  },
});
