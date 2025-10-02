import React, { useState, useEffect } from 'react';
import { CircleChevronDown, CircleChevronLeft } from 'lucide-react';
import { helper } from '@/app/utils/helper';
import Label from './nodes/Label';
import HasInput from './nodes/HasInput';
import HasOutput from './nodes/HasOutput';
import IsImplementedBy from './IsImplementedBy';
import Executes from './nodes/Executes';
import Evaluates from './nodes/Evaluates';
import Level from './nodes/Level';
import { useToast } from '@/components/ui/use-toast';
import { debounce } from 'lodash';
import AddToCartButton from '../cart/AddToCartButton';
import { getTypeFromStorage } from './utils/storage';
import { TreeNodeProps, TypeInfo } from './types';
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation'

const saveTypeToStorage = (nodeKey: string, typeInfo: TypeInfo): void => {
  try {
    const storedData = localStorage.getItem('node-keys');
    const nodeKeys = storedData ? JSON.parse(storedData) : {};
    nodeKeys[nodeKey] = typeInfo;
    localStorage.setItem('node-keys', JSON.stringify(nodeKeys));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const LoadingSpinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
);

const TreeNode: React.FC<TreeNodeProps> = ({
  data,
  parentOpen = false,
  onConceptSelect,
  onAuthorSelect,
  open,
  onOpenChange,
  statement,
  article,
  statementDetails,
  parent = null,
  label = null,
  tooltip = null,
  level = 0,
  color = false
}) => {
  const [isOpen, setIsOpen] = useState(parentOpen === true);
  const [typeInfo, setTypeInfo] = useState<TypeInfo | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (statementDetails) {
      setDetails(statementDetails)
    }
  }, [statementDetails]);

  useEffect(() => {
    const getNodeTypeInfo = debounce(async () => {
      if (!data) return;
      if (!data?.['@type']?.startsWith('doi:')) {
        setError('Invalid @type format');
        return;
      }

      const nodeKey = data['@type']
        .replace('doi:', '')
        .replace('21.T11969/', '');
      const cachedTypeInfo = getTypeFromStorage(nodeKey);
      if (cachedTypeInfo) {
        setTypeInfo(cachedTypeInfo);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/service/type-info?key=${encodeURIComponent(nodeKey)}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const fetchedTypeInfo = await response.json();
        if (fetchedTypeInfo.error) {
          throw new Error(fetchedTypeInfo.error);
        }

        setTypeInfo(fetchedTypeInfo);
        saveTypeToStorage(nodeKey, fetchedTypeInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    getNodeTypeInfo();

    return () => {
      getNodeTypeInfo.cancel();
    };
  }, [data]);

  const toggleNode = async () => {
    try {
      const response = await fetch(`${REBORN_API_URL}/articles/get_statement_by_id/?id=${statement.statement_id}`);
      if (!response.ok) {
        throw new Error(`Error fetching statement: ${response.status}`);
      }
      onOpenChange?.(statement.statement_id)
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching statement details:", error);
    } finally {
      setIsLoading(false);
    }
    if (window.location.pathname.includes('/statement/')) {
      router.push(`/statement/${statement.statement_id}`);
    } else {
      setIsOpen(!isOpen)
    }
  };

  const hasChildren = data && typeof data === 'object';

  if (!data) return null;

  const { toast } = useToast();

  return (
    <>
      {typeInfo && hasChildren && color && (
        <span className={`bg-[#5b9bd5] absolute -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
          {helper.capitalizeFirstLetter(helper.cleanFirstLetter(statement.type.name))}
        </span>
      )}
      <div className={`flex items-start p-2 transition-all duration-300${level ? ' ml-2.5' : ''}`}>
        <div className='flex-1 min-w-0 border-[#2f72ad] border-t-[5px] border-b-[#2f72ad] rounded-tl-[10px] rounded-tr-[10px]'>
          <div className="bg-[#f7fafc] p-2 text-[#353839] font-[700] text-sm flex items-center">
            Statement
            <div className="flex items-center flex-none p-1 rounded ml-auto">
              {hasChildren && !level && !color && (
                <>
                  <div className="transition-transform duration-300">
                    <AddToCartButton
                      statement={statement}
                      article={article}
                      size="sm"
                    />
                  </div>
                  {hasChildren && !level && !color && (
                    <div className='ml-2'>
                      {!isOpen ? (
                        <CircleChevronLeft className="text-[#2f72ad] cursor-pointer" size={19} onClick={toggleNode} />
                      ) : (
                        <CircleChevronDown className="text-[#2f72ad] cursor-pointer" size={19} onClick={toggleNode} />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            statement.type && (
              <>
                <div className="flex">
                  <Label
                    tooltip={tooltip}
                    parent={parent}
                    typeInfo={typeInfo}
                    onConceptSelect={onConceptSelect}
                    onAuthorSelect={onAuthorSelect}
                    color={color}
                    button={statement.type.name}
                    toggleNode={toggleNode}
                    statement={statement}
                    label={label}
                  />
                </div>
              </>
            )
          )}

          {details !== null && isOpen && (
            <div className={`pl-4 transition-all duration-300 ${isOpen || parentOpen ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="d-flex pr-0 mb-4 border-[#5b9ed9] border-l-[5px] border-t-[5px] border-l-[#5b9ed9] rounded-tl-[10px]">
                <div className={`bg-[#f7fafc] p-1 pl-2 text-[#353839] text-[12px] rounded-tl-[10px] font-[700]`}>
                  Data Analysis
                </div>
                <div className='p-2 pr-0'>
                  {
                    details.data_type.map((data_type: {
                      type: {
                        name: string;
                        properties: string[]
                      };
                      has_part: any;
                      components: any;
                      is_implemented_by: any;
                    }) => {
                      let evaluates = true
                      let level_targets = true
                      let turn = 1
                      return (
                        <span key={`data-type-${data_type.type.name}-${nanoid()}`}>
                          <div className="d-flex mb-4 border-[#71b4ef] border-l-[5px] border-t-[5px] border-l-[#71b4ef] rounded-tl-[10px]">
                            <div className='bg-[#f7fafc] text-[#353839] relative p-1 text-[12px] pl-4 rounded-tl-[10px] font-[700]'>
                              {helper.capitalizeFirstLetter(helper.cleanFirstLetter(data_type.type.name))}
                            </div>
                            <div className='p-2 pr-0'>
                              {data_type.type.properties?.map((type) => {
                                if (data_type.has_part[type] && data_type.has_part[type].length) {
                                  turn += 1
                                }
                                return (
                                  <div key={`property-${type}-${nanoid()}`}>
                                    {type === 'has_input' ? (
                                      <div className={`mx-0 ${turn > 1 ? 'pt-4' : ``}`} key={`has_input-all-${nanoid()}`}>
                                        <div key={`has_input-parent-${nanoid()}`} className="border-[#d9ebf7] border-l-[5px] border-t-[5px] border-l-[#d9ebf7] relative scrollbar-custom sm:overflow-visible overflow-auto rounded-tl-[10px]">
                                          <div className={`bg-[#f7fafc] relative p-1 text-[12px] text-[#353839] pl-4 rounded-tl-[5px] font-[700]`}>
                                            Input data
                                          </div>
                                          {data_type.has_part[type]?.map((input: any) => (
                                            <div
                                              key={`entry-${input.label}-${nanoid()}`}
                                              className="d-flex p-2"
                                            >
                                              <HasInput has_input={input} label={input.label} key={`has_input-${input.label}-${nanoid()}`} components={data_type.components} />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : type === 'has_output' ? (
                                      <div className={`mx-0 ${turn > 1 ? 'pt-4' : ``}`} key={`has_output-all-${nanoid()}`}>
                                        <div key={`has_output-parent-${nanoid()}`} className="border-[#d9ebf7] border-l-[5px] border-t-[5px] border-l-[#d9ebf7] relative scrollbar-custom sm:overflow-visible overflow-auto rounded-tl-[10px]">
                                          <div className={`bg-[#f7fafc] relative p-1 text-[12px] text-[#353839] pl-4 rounded-tl-[5px] font-[700]`}>
                                            Output data
                                          </div>
                                          {data_type.has_part[type]?.map((input: any) => (
                                            <div
                                              key={`entry-${input.label}-${nanoid()}`}
                                              className="d-flex p-2"
                                            >
                                              <HasOutput has_output={input} label={input.label} key={`has_input-${input.label}-${nanoid()}`} components={data_type.components} />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : type === 'executes' ? (
                                      data_type.has_part[type] !== undefined && data_type.has_part[type][0] !== undefined && (
                                        <div className={`mx-0 ${turn > 1 ? `` : ``}`} key={`has_output-all-${nanoid()}`}>
                                          <Executes executes={data_type.has_part[type][0]} key={`executes-${type}-${nanoid()}`} />
                                        </div>
                                      )
                                    ) : (type === 'evaluates' || type === 'evaluates_for') ? (
                                      (() => {
                                        if (evaluates) {
                                          evaluates = false
                                          return (data_type.has_part[type] && (
                                            <div className={`mx-0 ${turn > 1 ? 'pt-4' : ``}`} key={`has_output-all-${nanoid()}`}>
                                              <Evaluates evaluates={data_type.has_part['evaluates']} evaluates_for={data_type.has_part['evaluates_for']} key={`evaluates-${type}-${nanoid()}`} />
                                            </div>
                                          ))
                                        }
                                      })()
                                    ) : (type === 'level' || type === 'targets') ? (
                                      (() => {
                                        if (level_targets) {
                                          level_targets = false
                                          return (data_type.has_part[type] && (
                                            // <Evaluates evaluates={data_type.has_part['evaluates']} evaluates_for={data_type.has_part['evaluates_for']} key={`evaluates-${type}`} />
                                            <div className={`mx-0 ${turn > 1 ? 'pt-4' : ``}`} key={`has_output-all-${nanoid()}`}>
                                              <Level key={`targets-${type}-${nanoid()}`} level={data_type.has_part['level']} targets={data_type.has_part['targets']} components={data_type.components} />
                                            </div>
                                          ))
                                        }
                                      })()
                                    ) : type === 'label' ? (
                                      (() => {
                                        if (data_type.has_part[type].length) {
                                          return <h5 className="group cursor-default text-[#353839] text-[18px] leading-tight mb-2 pb-2 font-medium flex items-center gap-2">
                                            <span className="flex-1 cursor-pointer">{data_type.has_part[type]}</span>
                                          </h5>
                                        }
                                      })()
                                    ) : (
                                      // <>{type}{JSON.stringify(data_type.has_part[type])}</>
                                      <></>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </span>
                      )
                    })
                  }
                  {details.data_type[0] && details.data_type[0].is_implemented_by && details.data_type[0].is_implemented_by.map((implement: any) => {
                    return <IsImplementedBy data={implement} key={`is_implemented_by-${level}-${nanoid()}`} />
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface JsonTreeViewerProps {
  jsonData?: any;
  parentOpen?: any;
  handleTreeViewerClick?: any;
  onConceptSelect?: (concept: string) => void;
  onAuthorSelect?: (author: string) => void;
  open?: string;
  onOpenChange?: (open: string) => void;
  single?: boolean;
  statement?: any;
  article?: any;
  statementDetails?: any;
}

const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
  jsonData,
  handleTreeViewerClick,
  onConceptSelect,
  onAuthorSelect,
  open,
  onOpenChange,
  parentOpen = false,
  statement = null,
  article = null,
  statementDetails = null,
}) => {
  return (
    <TreeNode
      parentOpen={parentOpen}
      data={jsonData}
      statement={statement}
      open={open}
      onOpenChange={onOpenChange}
      article={article}
      statementDetails={statementDetails}
      onConceptSelect={onConceptSelect}
      handleTreeViewerClick={handleTreeViewerClick}
      onAuthorSelect={onAuthorSelect}
    />
  );
};

export default JsonTreeViewer;