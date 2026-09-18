export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.owner_name || !data.dog_name || !data.email) {
      return new Response(JSON.stringify({ error: 'Owner name, dog name, and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build phone from available fields
    const phone = data.cell_phone || data.home_phone || data.work_phone || '';

    // Store full form data as JSON
    const formDataJson = JSON.stringify(data);

    // Insert into D1 database
    if (env.INTAKE_DB) {
      await env.INTAKE_DB.prepare(
        'INSERT INTO intake_submissions (owner_name, dog_name, email, phone, form_data) VALUES (?, ?, ?, ?, ?)'
      ).bind(data.owner_name, data.dog_name, data.email, phone, formDataJson).run();
    }

    // Build email content
    const labels = {
      date: 'Date', owner_name: 'Owner Name', dog_name: "Dog's Name",
      address: 'Address', breed_mix: 'Breed/Mix', dob_age: 'D.O.B. or Age',
      city: 'City', state: 'State', zip: 'Zip', weight: 'Weight',
      color_markings: 'Color/Markings', home_phone: 'Home Phone',
      work_phone: 'Work Phone', cell_phone: 'Cell Phone', email: 'Email',
      occupation: 'Occupation', sex: 'Sex', spay_neuter_status: 'Spay/Neuter Status',
      spay_neuter_age: 'Spay/Neuter Age', housing_type: 'Housing Type',
      fenced_yard: 'Fenced Yard', invisible_fence: 'Invisible Fence',
      referral_source: 'Referral Source', referral_name: 'Referral Name',
      dog_obtained_from: 'Dog Obtained From', shelter_rescue_name: 'Shelter/Rescue Name',
      time_owned: 'Time Owned', previous_owners: 'Previous Owners',
      previous_owner_reason: 'Previous Owner Reason', id_type: 'ID Type',
      reason_for_dog: 'Reason for Getting Dog', owned_dogs_before: 'Owned Dogs Before',
      previous_dog_breeds: 'Previous Dog Breeds', breed_characteristics_choice: 'Breed Characteristics',
      vet_name: 'Vet Name', vet_city: 'Vet City', last_vet_visit: 'Last Vet Visit',
      last_vet_reason: 'Last Vet Visit Reason', last_vaccination_date: 'Last Vaccination Date',
      vaccines_given: 'Vaccines Given', current_health_problems: 'Current Health Problems',
      past_medical_conditions: 'Past Medical Conditions', allergies: 'Allergies',
      vet_handling_easy: 'Vet Handling Easy', ever_muzzled: 'Ever Muzzled',
      heartworm_preventative: 'Heartworm Preventative', heartworm_brand: 'Heartworm Brand',
      flea_tick_preventative: 'Flea/Tick Preventative', flea_tick_brand: 'Flea/Tick Brand',
      vet_contact_permission: 'Vet Contact Permission', vet_contact_initials: 'Vet Contact Initials',
      food_type: 'Food Type', food_frequency: 'Food Frequency', food_amount: 'Food Amount',
      food_times: 'Food Times', finishes_food: 'Finishes Food',
      food_left_down_duration: 'Food Left Down Duration', receives_treats: 'Receives Treats',
      treat_frequency_type: 'Treat Frequency/Type', favorite_treats: 'Favorite Treats',
      food_possessive: 'Food Possessive', food_possessive_description: 'Food Possessive Description',
      housetrained: 'Housetrained', crate_trained: 'Crate Trained',
      paper_trained: 'Paper Trained', litter_trained: 'Litter Trained',
      has_dog_door: 'Has Dog Door', elimination_frequency: 'Elimination Frequency',
      defecation_frequency: 'Defecation Frequency', exercise_type: 'Exercise Type',
      exercise_duration_frequency: 'Exercise Duration/Frequency',
      exercise_responsible_person: 'Exercise Responsible Person',
      collar_leash_type: 'Collar/Leash Type', reactive_on_walks: 'Reactive on Walks',
      reactivity_description: 'Reactivity Description', household_members: 'Household Members',
      training_responsible_person: 'Training Responsible Person', dog_belongs_to: 'Dog Belongs To',
      household_member_dislikes: 'Household Member Dislikes',
      household_member_frightened: 'Household Member Frightened',
      dog_frightened_of_member: 'Dog Frightened of Member',
      dog_when_not_home: 'Dog When Not Home', dog_when_not_home_detail: 'Dog When Not Home Detail',
      dog_allowed_indoors: 'Dog Allowed Indoors', confined_when_home: 'Confined When Home',
      confinement_method: 'Confinement Method', confinement_duration: 'Confinement Duration',
      confinement_reason: 'Confinement Reason', not_indoors_reason: 'Not Indoors Reason',
      outdoor_dog_wants_indoors: 'Outdoor Dog Wants Indoors', sleeps_where: 'Sleeps Where',
      sleeps_in_crate: 'Sleeps in Crate', hours_without_companionship: 'Hours Without Companionship',
      other_pets: 'Other Pets', gets_along_with_other_pets: 'Gets Along With Other Pets',
      plays_with_toys: 'Plays With Toys', favorite_toys_games: 'Favorite Toys/Games',
      other_activities: 'Other Activities', five_things_liked: 'Five Things Liked',
      five_things_to_change: 'Five Things to Change', training_history: 'Training History',
      group_class_completed: 'Group Class Completed', private_lessons: 'Private Lessons',
      sent_to_trainer: 'Sent to Trainer', trainer_name_org: 'Trainer Name/Org',
      training_methods: 'Training Methods', known_behaviors: 'Known Behaviors',
      behavior_percentages: 'Behavior Percentages', behavioral_issues: 'Behavioral Issues',
      behavioral_issues_description: 'Behavioral Issues Description',
      correction_procedures: 'Correction Procedures', has_bitten_person: 'Has Bitten Person',
      has_bitten_animal: 'Has Bitten Animal', bite_description: 'Bite Description',
      medical_attention_needed: 'Medical Attention Needed',
      medical_attention_explanation: 'Medical Attention Explanation',
      reaction_to_stranger: 'Reaction to Stranger', last_stranger_visit: 'Last Stranger Visit',
      help_requested: 'Help Requested', additional_info: 'Additional Info'
    };

    const emailRows = [];
    for (const [key, label] of Object.entries(labels)) {
      if (data[key]) {
        emailRows.push(`<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;width:200px;">${label}:</td><td style="padding:4px 0;">${String(data[key]).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`);
      }
    }

    const emailHtml = `<h2>New Client Intake Form Submission</h2><p>A new intake form has been submitted for <strong>${data.owner_name}</strong> and their dog <strong>${data.dog_name}</strong>.</p><table style="font-family:Arial,sans-serif;font-size:14px;color:#333;border-collapse:collapse;">${emailRows.join('\n')}</table>`;

    // Send email via Resend
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'For the Love of Dog <noreply@forthelovedog.com>',
          to: ['clairefortheloveofdog@gmail.com'],
          subject: `New Intake Form: ${data.owner_name} - ${data.dog_name}`,
          html: emailHtml
        })
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
