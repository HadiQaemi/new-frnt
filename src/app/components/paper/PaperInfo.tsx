import { BookOpenText, Calendar, User, CopyIcon, Scan, GraduationCap, MousePointer2, Dot } from 'lucide-react'
import CustomPopover from '../shared/CustomPopover'
import { usePopoverManager } from '@/app/hooks/usePopoverManager'
import TruncatedAbstract from './TruncatedAbstract'
import { useToast } from '@/components/ui/use-toast'
import { helper } from '@/app/utils/helper'
import { useEffect } from 'react'
import Image from 'next/image';
import ORCID from '../../../assets/images/ORCID_iD.svg';

interface Author {
  name: string
  identifier: string
}

interface ResearchField {
  label: string
  related_identifier: string[]
}

interface Journal {
  label: string
  '@id': string
  type: 'journal'
}

interface Conference {
  label: string
  '@id': string
  type: 'conference'
}


interface PaperInfoProps {
  paper: any
  onJournalSelect: (journal: Journal | Conference) => void
  onResearchFieldSelect: (field: ResearchField) => void
  onAuthorSelect: (author: Author) => void
}

const PaperInfo: React.FC<PaperInfoProps> = ({
  paper,
  onJournalSelect,
  onResearchFieldSelect,
  onAuthorSelect
}) => {
  const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager()
  const renderIdentifiersList = (identifiers: string[]) => {
    if (typeof identifiers !== 'object')
      identifiers = [identifiers]
    return (
      <>
        {identifiers && identifiers.map((id, index) => (
          <div key={index} className="mb-1 py-0 px-3">
            <a
              href={id}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 break-all text-sm flex items-center"
              onClick={(e) => {
                if (e.target instanceof Element && e.target.closest('.overlay-trigger')) {
                  e.stopPropagation()
                  handlePopoverToggle("", false)
                }
              }}
            >
              {id.includes("https://orcid.org/") && (
                <Image
                  src={ORCID}
                  alt="ORCID Logo"
                  width={24}
                  height={24}
                  className="object-contain mr-2"
                />
              )}
              <span>
                {helper.cleanString(id).replace('https://orcid.org/', '')}
              </span>
            </a>
          </div>
        ))}
      </>
    )
  }
  const { toast } = useToast();
  const copyToClipboard = (rawText: any) => {
    const formattedText = rawText;

    navigator.clipboard.writeText(formattedText)
      .then(() =>
        toast({
          title: "Success!",
          description: "Address copied to clipboard!",
          className: "bg-green-100",
        })
      )
      .catch(() =>
        toast({
          title: "Error!",
          description: "Failed to copy",
          className: "bg-red-100",
        })
      );
  };
  const venue = paper.scientific_venue ? paper.scientific_venue : paper.journal ? paper.journal : paper.conference
  let research_field = null
  if (paper.research_fields !== undefined) {
    research_field = paper.research_fields
    if (Array.isArray(paper.research_fields))
      research_field = paper.research_fields[0]
  }

  useEffect(() => {
    const localJournals = localStorage.getItem('journals') || '[]'
    if (localJournals.length) {
      const storedVenues = JSON.parse(localJournals);
      const updatedVenues = [...storedVenues];
    }

    if (research_field) {
      const storedResearchFields = JSON.parse(localStorage.getItem('fields') || '[]');
      const updatedResearchFields = [...storedResearchFields];
      const research_field_id = research_field.research_field_id ? research_field.research_field_id : research_field.id;
      if (!storedResearchFields.some((u: any) => u.id === research_field_id)) {
        updatedResearchFields.push({
          id: research_field_id,
          name: research_field.label
        });
        localStorage.setItem('fields', JSON.stringify(updatedResearchFields))
      }
    }

    if (paper?.authors) {
      const storedAuthors = JSON.parse(localStorage.getItem('authors') || '[]');
      const updatedAuthors = [...storedAuthors];
      paper.authors.forEach((author: any) => {
        const author_id = author.author_id ? author.author_id : author.id;
        if (!storedAuthors.some((u: any) => u.id === author_id)) {
          updatedAuthors.push({
            id: author_id,
            name: author.name
          });
          localStorage.setItem('authors', JSON.stringify(updatedAuthors));
        }
      });
    }
  }, [])

  return (
    <div>
      <div ref={containerRef} className='bg-white border-[#1e3a5f] border-t-[5px] rounded-tl-[10px] rounded-tr-[10px]'>
        <div className="bg-[#f7fafc] p-2 pl-4 text-[#353839] font-[700] text-sm">
          Loom Record
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1">
            <h4 className="text-[#353839] text-2xl leading-tight mb-2 font-medium">{paper.name}</h4>
          </div>

          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <span className="badge overlay-trigger me-2 mb-2 text-sm">
                <Scan className="me-1 inline text-[#353839] w-[1.7rem] h-[1.7rem]" />
                <GraduationCap className="inline -ml-[25px] text-[#353839] w-[0.9rem] text-xs" />
                <span className='ml-3'>{research_field['label']}</span>
              </span>
              <span className="badge me-2 text-sm">
                <Calendar className="me-1 inline underline text-[#353839]" />
                {paper.date_published}
              </span>
              <span className='mr-2 text-sm'>
                <User className="me-1 inline text-[#353839]" />
                {paper.authors.map((author: any, index: any) => (
                  <CustomPopover
                    key={`author-${index}`}
                    id={`popover-${`${author.name}`}-${index}`}
                    subTitle="Show content for "
                    title={`${author.name}`}
                    affiliation={author.affiliation}
                    orcid={author.orcid && !author.orcid.startsWith('#')
                      ? [author.orcid]
                      : []}
                    show={activePopover === `${author.name}`}
                    onToggle={(show) => handlePopoverToggle(`${author.name}`, show)}
                    onSelect={() => onAuthorSelect(author)}
                    icon={User}
                    trigger={
                      <span
                        className={`badge cursor-pointer overlay-trigger mb-2 underline text-sm ${index < 1 ? 'inline md:inline' : 'hidden sm:hidden md:inline'}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePopoverToggle(`${author.name}`, activePopover !== `${author.name}`)
                        }}
                      >
                        {`${author.name}`}
                        {(paper.authors.length != (index + 1)) && <Dot className='inline text-[#353839]' />}
                      </span>
                    }
                  >
                    {renderIdentifiersList([])}
                  </CustomPopover>
                ))}
              </span>
              {paper.dois && (
                <span className='inline-block'>
                  <MousePointer2 className='inline mr-1 text-gray-500 transform scale-x-[-1]' />
                  <a href={paper.dois} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm mr-2">
                    {paper.dois}
                  </a>
                  <CopyIcon onClick={() => copyToClipboard(paper.dois)} className="inline h-4 w-4 text-gray-700 hover:text-gray-900 cursor-pointer" />
                </span>
              )}
            </div>
          </div>

          <div className='my-4'>
            {paper && <TruncatedAbstract text={paper.abstract} />}
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12 sm:col-span-6">
            {venue && (
              <CustomPopover
                id={`popover-${venue.label}`}
                subTitle="Show content for "
                title={venue.label}
                show={activePopover === venue.label}
                onToggle={(show) => handlePopoverToggle(venue.label, show)}
                icon={BookOpenText}
                onSelect={() => onJournalSelect({ ...venue })}
                trigger={
                  <span
                    className="badge cursor-pointer overlay-trigger underline mr-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePopoverToggle(venue.label, activePopover !== venue.label)
                    }}
                  >
                    <BookOpenText className="me-1 inline text-gray-500" />
                    {venue.label}
                  </span>
                }
              >
                {renderIdentifiersList([venue.identifier])}
              </CustomPopover>
            )}
          </div>
        </div>
      </div>
    </div >
  )
}

export default PaperInfo