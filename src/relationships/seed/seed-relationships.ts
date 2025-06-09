import { Injectable } from '@nestjs/common';
import { RelationshipsService } from '../relationships.service';
import { CreateRelationshipDto } from '../dto/create-relationship.dto';
import { CreateTranslationDto } from '../dto/create-translation.dto';

@Injectable()
export class RelationshipSeeder {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  async seed() {
    const relationships: CreateRelationshipDto[] = [
      { key: 'father', description: 'Biological father' },
      { key: 'mother', description: 'Biological mother' },
      { key: 'son', description: 'Biological son' },
      { key: 'daughter', description: 'Biological daughter' },
      { key: 'brother', description: 'Biological brother' },
      { key: 'sister', description: 'Biological sister' },
      { key: 'husband', description: 'Spouse (husband)' },
      { key: 'wife', description: 'Spouse (wife)' },
      { key: 'grandfather', description: 'Paternal grandfather' },
      { key: 'grandmother', description: 'Paternal grandmother' },
    ];

    const translations: { key: string; language: string; label: string }[] = [
      // Father translations
      { key: 'father', language: 'en', label: 'Father' },
      { key: 'father', language: 'ta', label: 'அப்பா' },
      { key: 'father', language: 'hi', label: 'पिता' },
      { key: 'father', language: 'ma', label: 'പിതാവ്' },
      { key: 'father', language: 'ka', label: 'ತಂದೆ' },

      // Mother translations
      { key: 'mother', language: 'en', label: 'Mother' },
      { key: 'mother', language: 'ta', label: 'அम्मा' },
      { key: 'mother', language: 'hi', label: 'माता' },
      { key: 'mother', language: 'ma', label: 'അമ്മ' },
      { key: 'mother', language: 'ka', label: 'ತಾಯಿ' },

      // Son translations
      { key: 'son', language: 'en', label: 'Son' },
      { key: 'son', language: 'ta', label: 'மகன்' },
      { key: 'son', language: 'hi', label: 'बेटा' },
      { key: 'son', language: 'ma', label: 'മകൻ' },
      { key: 'son', language: 'ka', label: 'ಮಗ' },

      // Daughter translations
      { key: 'daughter', language: 'en', label: 'Daughter' },
      { key: 'daughter', language: 'ta', label: 'மகள்' },
      { key: 'daughter', language: 'hi', label: 'बेटी' },
      { key: 'daughter', language: 'ma', label: 'മകൾ' },
      { key: 'daughter', language: 'ka', label: 'ಮಗಳು' },

      // Brother translations
      { key: 'brother', language: 'en', label: 'Brother' },
      { key: 'brother', language: 'ta', label: 'சகோதரன்' },
      { key: 'brother', language: 'hi', label: 'भाई' },
      { key: 'brother', language: 'ma', label: 'സഹോദരൻ' },
      { key: 'brother', language: 'ka', label: 'ಸಹೋದರ' },

      // Sister translations
      { key: 'sister', language: 'en', label: 'Sister' },
      { key: 'sister', language: 'ta', label: 'சகோதரி' },
      { key: 'sister', language: 'hi', label: 'बहन' },
      { key: 'sister', language: 'ma', label: 'സഹോദരി' },
      { key: 'sister', language: 'ka', label: 'ಸಹೋದರಿ' },

      // Husband translations
      { key: 'husband', language: 'en', label: 'Husband' },
      { key: 'husband', language: 'ta', label: 'கணவன்' },
      { key: 'husband', language: 'hi', label: 'पति' },
      { key: 'husband', language: 'ma', label: 'ഭർത്താവ്' },
      { key: 'husband', language: 'ka', label: 'ಪತಿ' },

      // Wife translations
      { key: 'wife', language: 'en', label: 'Wife' },
      { key: 'wife', language: 'ta', label: 'மனைவி' },
      { key: 'wife', language: 'hi', label: 'पत्नी' },
      { key: 'wife', language: 'ma', label: 'ഭാര്യ' },
      { key: 'wife', language: 'ka', label: 'ಪತ್ನಿ' },

      // Grandfather translations
      { key: 'grandfather', language: 'en', label: 'Grandfather' },
      { key: 'grandfather', language: 'ta', label: 'தாத்தா' },
      { key: 'grandfather', language: 'hi', label: 'दादाजी' },
      { key: 'grandfather', language: 'ma', label: 'മുത്തച്ഛൻ' },
      { key: 'grandfather', language: 'ka', label: 'ಅಜ್ಜ' },

      // Grandmother translations
      { key: 'grandmother', language: 'en', label: 'Grandmother' },
      { key: 'grandmother', language: 'ta', label: 'பாட்டி' },
      { key: 'grandmother', language: 'hi', label: 'दादीजी' },
      { key: 'grandmother', language: 'ma', label: 'മുത്തശ്ശി' },
      { key: 'grandmother', language: 'ka', label: 'ಅಜ್ಜಿ' },
    ];

    console.log('Starting relationship seeding...');

    for (const rel of relationships) {
      try {
        // Try to find existing relationship first
        const existing = await this.relationshipsService.findByKey(rel.key);
        let relationship;

        if (existing) {
          console.log(`Relationship '${rel.key}' already exists, skipping creation`);
          relationship = existing;
        } else {
          console.log(`Creating relationship '${rel.key}'`);
          relationship = await this.relationshipsService.createRelationship(rel);
        }

        // Add translations for this relationship
        const relTranslations = translations.filter((t) => t.key === rel.key);
        for (const trans of relTranslations) {
          try {
            await this.relationshipsService.addTranslation(relationship.id, {
              language: trans.language,
              label: trans.label,
            } as CreateTranslationDto);
            console.log(`Added translation for '${rel.key}' in '${trans.language}'`);
          } catch (translationError) {
            // Translation might already exist, log and continue
            console.log(`Translation for '${rel.key}' in '${trans.language}' might already exist, skipping`);
          }
        }
      } catch (error) {
        console.error(`Error processing relationship '${rel.key}':`, error.message);
        // Continue with next relationship instead of failing completely
      }
    }

    console.log('Relationship seeding completed');
  }
}